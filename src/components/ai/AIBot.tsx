'use client';

import { useAI } from '@/providers/AIProvider';
import { useAppSelector, selectEntryTypesArray, selectEntryInstancesMap, selectReminderRecordArray } from '@/entry/store';
import { useEffect, useState, useMemo, useRef } from 'react';

import { RiRobot2Line, RiCloseLine, RiChat1Line } from 'react-icons/ri';
import { TbSend } from 'react-icons/tb';
import Button from '../button';

import { ChatWebLLM } from '@langchain/community/chat_models/webllm';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { Runnable } from '@langchain/core/runnables';
import { EntryInstance, ReminderRecord } from '@/entry/types-constants';

const serializeUserData = (
  entryTypes: any[],
  entryInstances: { [key: string]: EntryInstance[] },
  reminders: ReminderRecord[],
) => {
  const data = {
    tasks: entryTypes.map((t: { id: any; title: any; routine: any; defaultPoints: any }) => ({
      id: t.id,
      title: t.title,
      routine: t.routine,
      defaultPoints: t.defaultPoints,
    })),
    history: entryInstances,
    reminders: reminders,
  };
  return JSON.stringify(data, null, 2);
};

const DEFAULT_MODEL_ID = 'Qwen3-0.6B-q0f16-MLC';

const PROMPT_TEMPLATE = ChatPromptTemplate.fromMessages([
  new SystemMessage(`# 角色
你是一个贴心的生活助手。你的性格友好、乐于助人、有分寸感。

# 核心能力与规则
1.  **意图判断**：你的首要任务是判断用户的最新问题是否与他/她的“日常任务数据”相关（比如询问“我今天该做什么？”、“我上次交房租是什么时候？”等）。
2.  **条件化使用数据**：
    -   **如果**问题与日常任务相关，你必须根据我提供的“日常任务数据”和“对话历史”来回答。
    -   **如果**问题是通用的知识、闲聊、创意或其他无关话题（如“今天天气怎么样？”、“给我讲个笑话”），你**必须忽略**“日常任务数据”，像一个通用AI助手一样回答，并利用“对话历史”保持对话的连贯性。
3.  **对话风格**：保持简洁、自然、友好的对话风格。不要输出JSON或任何代码格式。
`),
  new HumanMessage(`
# 上下文信息

## 对话历史
{history}

## 我的日常任务数据（仅在用户提问相关时参考）
今天是 {currentDate}。
数据：{userData}

## 用户最新问题
{latestQuestion}

# 回复
`),
]);

export default function AIBot() {
  const { isReady, progress, loadModel, isLoading, engine } = useAI();
  const [chatModel, setChatModel] = useState<ChatWebLLM | null>(null);
  const [chain, setChain] = useState<Runnable | null>(null);

  const [hasInitiatedLoad, setHasInitiatedLoad] = useState(false);

  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [performanceStats, setPerformanceStats] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const chatBoxRef = useRef<HTMLDivElement>(null);
  const entryTypes = useAppSelector(selectEntryTypesArray);
  const entryInstances = useAppSelector(selectEntryInstancesMap);
  const reminders = useAppSelector(selectReminderRecordArray);
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
        setIsGenerating(true);
        const model = new ChatWebLLM({
          model: DEFAULT_MODEL_ID,
          chatOptions: { temperature: 0.7 },
        });

        await (model as any).initialize();

        setChatModel(model);
        const newChain = PROMPT_TEMPLATE.pipe(model).pipe(new StringOutputParser());
        setChain(newChain);
        console.log('AIBot: Chat chain created successfully.');
        setIsGenerating(false);
      }
    };

    initChat();
  }, [isReady, engine, chain]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatHistory, isGenerating]);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isGenerating || !chain) return;

    const latestQuestion = userInput;

    const formattedHistory = chatHistory
      .map((msg) => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`)
      .join('\n');

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
      const stream = await chain.stream({
        history: formattedHistory,
        userData: userDataString,
        currentDate: currentDate,
        latestQuestion: latestQuestion,
      });

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
      setChatHistory((prev) => [...prev.slice(0, -1), { role: 'assistant', content: '抱歉，我好像出错了。' }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const isModelLoading = progress.progress < 1;

  return (
    <>
      {/* 悬浮气泡 */}
      <div
        className={`fixed bottom-5 right-5 z-50 cursor-pointer rounded-lg bg-white p-4 shadow-xl transition-all duration-300 hover:scale-105 ${
          isPanelOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
        onClick={() => setIsPanelOpen(true)}
      >
        <div className="flex items-center gap-3">
          {isModelLoading ? (
            <RiRobot2Line className="h-8 w-8 animate-spin text-diary-primary" />
          ) : (
            <RiChat1Line className="h-8 w-8 text-diary-primary" />
          )}
          <div className="max-w-xs text-sm text-gray-700">
            {isModelLoading ? (
              <div>
                <p>{progress.text}</p>
                <div className="mt-1 h-1.5 w-full rounded-full bg-gray-200">
                  <div className="h-1.5 rounded-full bg-diary-primary" style={{ width: `${progress.progress * 100}%` }}></div>
                </div>
              </div>
            ) : (
              'AI助手已就绪'
            )}
          </div>
        </div>
      </div>

      {/* 聊天主面板 */}
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
            <RiRobot2Line className="h-12 w-12 animate-spin text-diary-primary" />
            <p className="mt-4 text-sm text-gray-600">{progress.text}</p>
            <div className="mt-2 h-2.5 w-4/5 rounded-full bg-gray-200">
              <div className="h-2.5 rounded-full bg-diary-primary" style={{ width: `${progress.progress * 100}%` }}></div>
            </div>
            <p className="mt-2 text-xs text-gray-400">(首次加载模型可能需要几分钟)</p>
          </div>
        )}
      </div>
    </>
  );
}
