'use client';

import { useAI } from '@/providers/AIProvider';
import { useEffect, useState, useMemo, useRef } from 'react';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isBetween from 'dayjs/plugin/isBetween';

import { RiRobot2Line, RiCloseLine, RiChat1Line } from 'react-icons/ri';
import { TbSend } from 'react-icons/tb';
import Button from '../button';

import { ChatWebLLM } from '@langchain/community/chat_models/webllm';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { Runnable } from '@langchain/core/runnables';
import { EntryInstance, EntryType, ReminderRecord, RoutineEnum } from '@/entry/types-constants';
import { entryTypesArrayAtom, entryInstancesMapAtom, reminderRecordsAtom } from '@/atoms';
import { useAtomValue } from 'jotai';

dayjs.extend(isToday);
dayjs.extend(isBetween);

const getPendingTasksForToday = (entryTypes: EntryType[], entryInstancesMap: { [key: string]: EntryInstance[] }): string[] => {
  const pendingTasks: string[] = [];
  const todayStr = dayjs().format('YYYY-MM-DD');
  const todaysInstances = new Set(entryInstancesMap[todayStr]?.map((inst) => inst.entryTypeId) ?? []);

  entryTypes.forEach((task) => {
    if (todaysInstances.has(task.id)) return;
    switch (task.routine) {
      case RoutineEnum.daily:
        pendingTasks.push(task.title);
        break;
      case RoutineEnum.weekly: {
        const startOfWeek = dayjs().startOf('week');
        const endOfWeek = dayjs().endOf('week');
        let doneThisWeek = false;
        for (let day = startOfWeek; day.isBefore(endOfWeek.add(1, 'day')); day = day.add(1, 'day')) {
          if (entryInstancesMap[day.format('YYYY-MM-DD')]?.some((inst) => inst.entryTypeId === task.id)) {
            doneThisWeek = true;
            break;
          }
        }
        if (!doneThisWeek) pendingTasks.push(task.title);
        break;
      }
      case RoutineEnum.monthly: {
        const startOfMonth = dayjs().startOf('month');
        const endOfMonth = dayjs().endOf('month');
        let doneThisMonth = false;
        for (let day = startOfMonth; day.isBefore(endOfMonth.add(1, 'day')); day = day.add(1, 'day')) {
          if (entryInstancesMap[day.format('YYYY-MM-DD')]?.some((inst) => inst.entryTypeId === task.id)) {
            doneThisMonth = true;
            break;
          }
        }
        if (!doneThisMonth) pendingTasks.push(task.title);
        break;
      }
      default:
        break;
    }
  });
  return pendingTasks;
};

const serializeUserData = (
  entryTypes: any[],
  entryInstances: { [key: string]: EntryInstance[] },
  reminders: ReminderRecord[],
) => {
  const data = {
    tasks: entryTypes.map((t) => ({ id: t.id, title: t.title, routine: t.routine, defaultPoints: t.defaultPoints })),
    history: entryInstances,
    reminders: reminders,
  };
  return JSON.stringify(data, null, 2);
};

const DEFAULT_MODEL_ID = 'Qwen3-0.6B-q4f32_1-MLC';

const SUGGESTION_PROMPT_TEMPLATE = ChatPromptTemplate.fromMessages([
  [
    'system',
    `# 角色与指令
你是一个极其严谨、聪明的任务规划专家。你的任务是根据我提供的待办任务列表，生成一个自然、流畅的中文提醒。
你的最终输出必须是干净、流畅的一句话，**绝对不要在回答中展示你的思考步骤或任何计算过程或标签**。
请模仿示例的风格。

---
[示例 1]
输入: '刷牙', '写周报'
输出: 今天别忘了这两件事哦：刷牙和写周报。

[示例 2]
输入: '健身'
输出: 今天是锻炼的好日子，别忘了去健身房哦！
`,
  ],
  [
    'human',
    `---
[正式任务]

# 输入
{pendingTasks}

# 输出`,
  ],
]);

const PROMPT_TEMPLATE = ChatPromptTemplate.fromMessages([
  [
    'system',
    `# 角色
你是一个贴心的生活助手。你的性格友好、乐于助人、有分寸感。

# 核心能力与规则
1.  **意图判断**：你的首要任务是判断用户的最新问题是否与他/她的“日常任务数据”相关（比如询问“我今天该做什么？”、“我上次交房租是什么时候？”等）。
2.  **条件化使用数据**：
    -   **如果**问题与日常任务相关，你必须根据我提供的“日常任务数据”和“对话历史”来回答。
    -   **如果**问题是通用的知识、闲聊、创意或其他无关话题（如“今天天气怎么样？”、“给我讲个笑话”），你**必须忽略**“日常任务数据”，像一个通用AI助手一样回答，并利用“对话历史”保持对话的贯穿性。
3.  **对话风格**：保持简洁、自然、友好的对话风格。不要输出JSON或任何代码格式。`,
  ],
  [
    'human',
    `
# 上下文信息

## 我的日常任务数据（仅在用户提问相关时参考）
今天是 {currentDate}。
数据：{userData}

## 对话历史
{history}

## 用户最新问题
{latestQuestion}

# 回复
`,
  ],
]);

export default function AIBot() {
  const { isReady, progress, loadModel, isLoading, engine, error } = useAI();
  const [chatModel, setChatModel] = useState<ChatWebLLM | null>(null);
  const [chain, setChain] = useState<Runnable | null>(null);

  const [hasInitiatedLoad, setHasInitiatedLoad] = useState(false);

  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [performanceStats, setPerformanceStats] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const [dailySuggestion, setDailySuggestion] = useState<string | null>(null);

  const chatBoxRef = useRef<HTMLDivElement>(null);
  const entryTypes = useAtomValue(entryTypesArrayAtom);
  const entryInstances = useAtomValue(entryInstancesMapAtom);
  const reminders = useAtomValue(reminderRecordsAtom);
  const userDataString = useMemo(
    () => serializeUserData(entryTypes, entryInstances, reminders),
    [entryTypes, entryInstances, reminders],
  );

  useEffect(() => {
    if (!hasInitiatedLoad) {
      console.log('AIBot: Component mounted, triggering loadModel...');
      loadModel(DEFAULT_MODEL_ID);
      setHasInitiatedLoad(true);
    }
  }, [loadModel, hasInitiatedLoad]);

  useEffect(() => {
    const initChat = async () => {
      if (isReady && engine && !chain) {
        console.log('AIBot: Engine is ready, initializing ChatWebLLM...');
        const model = new ChatWebLLM({ model: DEFAULT_MODEL_ID, chatOptions: { temperature: 0.7 } });
        await (model as any).initialize();
        setChatModel(model);
        const newChain = PROMPT_TEMPLATE.pipe(model).pipe(new StringOutputParser());
        setChain(newChain);
        console.log('AIBot: Chat chain created successfully.');
      }
    };
    initChat();
  }, [isReady, engine, chain]);

  useEffect(() => {
    const generateDailySuggestion = async (model: ChatWebLLM) => {
      const storageKey = 'daily_suggestion';
      const todayStr = new Date().toISOString().split('T')[0];
      const rawData = localStorage.getItem(storageKey);
      if (rawData) {
        try {
          const suggestionData = JSON.parse(rawData);
          if (suggestionData.date === todayStr) {
            setDailySuggestion(suggestionData.content);
            return;
          }
        } catch (e) {
          console.error('Failed to parse daily suggestion from localStorage', e);
          localStorage.removeItem(storageKey);
        }
      }

      setDailySuggestion('正在为您生成今日建议...');
      const pendingTasks = getPendingTasksForToday(entryTypes, entryInstances);
      if (pendingTasks.length === 0) {
        const suggestion = '今天所有计划都完成啦，可以好好放松一下！';
        setDailySuggestion(suggestion);
        localStorage.setItem(storageKey, JSON.stringify({ date: todayStr, content: suggestion }));
        return;
      }

      const suggestionChain = SUGGESTION_PROMPT_TEMPLATE.pipe(model).pipe(new StringOutputParser());
      const payload = { pendingTasks: pendingTasks.join(', ') };

      const finalPrompt = await SUGGESTION_PROMPT_TEMPLATE.format(payload);
      console.log('--- Daily Suggestion Final Prompt ---');
      console.log(finalPrompt);
      console.log('------------------------------------');

      try {
        const suggestion = await suggestionChain.invoke(payload);
        setDailySuggestion(suggestion);
        localStorage.setItem(storageKey, JSON.stringify({ date: todayStr, content: suggestion }));
      } catch (e) {
        console.error('Failed to generate daily suggestion:', e);
        setDailySuggestion('生成建议失败，但您可以直接向我提问。');
      }
    };

    if (isReady && chatModel && !dailySuggestion) {
      generateDailySuggestion(chatModel);
    }
  }, [isReady, chatModel, dailySuggestion, entryTypes, entryInstances]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatHistory, isGenerating]);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isGenerating || !chain) return;

    const latestQuestion = userInput;

    const historyForAI = [...chatHistory];
    if (historyForAI.length === 0 && dailySuggestion) {
      historyForAI.unshift({ role: 'assistant', content: dailySuggestion });
    }
    historyForAI.push({ role: 'user', content: latestQuestion });

    const formattedHistory = historyForAI.map((msg) => `${msg.role === 'user' ? '用户' : 'AI'}: ${msg.content}`).join('\n');

    setChatHistory((prev) => [...prev, { role: 'user', content: latestQuestion }, { role: 'assistant', content: '...' }]);
    setUserInput('');
    setIsGenerating(true);

    const currentDate = new Date().toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });

    try {
      const promptPayload = {
        history: formattedHistory,
        userData: userDataString,
        currentDate: currentDate,
        latestQuestion: latestQuestion,
      };

      const finalPrompt = await PROMPT_TEMPLATE.format(promptPayload);
      console.log('--- AI Chat Final Prompt ---');
      console.log(finalPrompt);
      console.log('----------------------------');

      const stream = await chain.stream(promptPayload);

      let currentResponse = '';
      for await (const chunk of stream) {
        currentResponse += chunk;
        setChatHistory((prev) => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1].content = currentResponse;
          return newHistory;
        });
      }
    } catch (error) {
      console.error('Error during chat generation:', error);
      if (error instanceof Error && error.message.includes('ContextWindowSizeExceededError')) {
        setChatHistory((prev) => [
          ...prev.slice(0, -1),
          {
            role: 'assistant',
            content: '抱歉，当前聊天已达到窗口上限。',
          },
        ]);
      } else {
        setChatHistory((prev) => [...prev.slice(0, -1), { role: 'assistant', content: '抱歉，我好像出错了。' }]);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBubbleClick = () => {
    if (error) {
      loadModel(DEFAULT_MODEL_ID);
    } else {
      setIsPanelOpen(true);
    }
  };

  const renderBubbleContent = () => {
    if (error) {
      return (
        <div className="flex items-center gap-3">
          <RiChat1Line className="h-8 w-8 text-red-500" />
          <div className="max-w-xs text-sm text-gray-700">
            <p className="font-semibold text-red-500">AI 加载失败</p>
            <p className="text-xs text-gray-500">点击重试</p>
          </div>
        </div>
      );
    }
    if (!isReady || !dailySuggestion) {
      const loadingText = dailySuggestion || progress.text;
      return (
        <div className="flex items-center gap-3">
          <RiRobot2Line className="h-8 w-8 animate-spin text-diary-primary" />
          <div className="max-w-xs text-sm text-gray-700">
            <p>{loadingText}</p>
            {isLoading && (
              <div className="mt-1 h-1.5 w-full rounded-full bg-gray-200">
                <div className="h-1.5 rounded-full bg-diary-primary" style={{ width: `${progress.progress * 100}%` }}></div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-3">
        <RiChat1Line className="h-8 w-8 text-diary-primary" />
        <div className="max-w-xs text-sm text-gray-700">{dailySuggestion}</div>
      </div>
    );
  };

  return (
    <>
      <div
        className={`fixed bottom-5 right-5 z-50 cursor-pointer rounded-lg bg-white p-4 shadow-xl transition-all duration-300 hover:scale-105 ${
          isPanelOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
        onClick={handleBubbleClick}
      >
        {renderBubbleContent()}
      </div>
      <div
        className={`fixed bottom-20 right-5 z-50 flex h-[70vh] w-96 flex-col rounded-xl bg-gray-50 shadow-2xl transition-all duration-300 ${
          isPanelOpen ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
        }`}
      >
        <div className="flex items-center justify-between border-b bg-white p-4">
          <h3 className="font-semibold">AI Assistant</h3>
          <button className="text-gray-600" onClick={() => setIsPanelOpen(false)}>
            <RiCloseLine className="h-6 w-6" />
          </button>
        </div>
        {isReady && chain ? (
          <>
            <div ref={chatBoxRef} className="flex-1 overflow-y-auto p-4">
              {chatHistory.map((msg, index) => (
                <div key={index} className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-full break-words rounded-lg px-3 py-2 ${
                      msg.role === 'user' ? 'bg-diary-primary text-white' : 'bg-gray-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleChatSubmit} className="flex items-center border-t bg-white p-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask me anything..."
                className="focus:border-blue-500 focus:ring-blue-500 flex-1 rounded-lg border-gray-300 p-2"
                disabled={isGenerating || !chain}
              />
              <Button type="primary" htmlType="submit" disabled={isGenerating || !chain} className="ml-2 aspect-square p-3">
                <TbSend />
              </Button>
            </form>
            <div className="border-t bg-white p-2 text-xs text-gray-500">
              <pre className="whitespace-pre-wrap font-sans">{performanceStats || 'Performance stats will appear here.'}</pre>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-4 text-center">
            {error ? (
              <>
                <RiChat1Line className="h-12 w-12 text-red-500" />
                <p className="mt-4 font-semibold text-red-500">加载失败</p>
                <p className="mt-2 text-xs text-gray-500">{error}</p>
                <Button type="primary" onClick={() => loadModel(DEFAULT_MODEL_ID)} className="mt-4">
                  重试
                </Button>
              </>
            ) : (
              <>
                <RiRobot2Line className="h-12 w-12 animate-spin text-diary-primary" />
                <p className="mt-4 text-sm text-gray-600">{progress.text}</p>
                <div className="mt-2 h-2.5 w-4/5 rounded-full bg-gray-200">
                  <div className="h-2.5 rounded-full bg-diary-primary" style={{ width: `${progress.progress * 100}%` }}></div>
                </div>
                <p className="mt-2 text-xs text-gray-400">(首次加载模型可能需要几分钟)</p>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
