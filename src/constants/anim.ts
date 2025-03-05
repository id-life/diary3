import { Variants } from 'framer-motion';

// 通用的缓动函数
export const EASE = [0.4, 0, 0.2, 1];

// 侧边栏导航动画配置
export const sidebarNavVariants = {
  initial: {
    height: 0,
    opacity: 0,
    y: -20,
  },
  animate: {
    height: 'auto',
    opacity: 1,
    y: 0,
  },
  exit: {
    height: 0,
    opacity: 0,
    y: 20,
    transition: {
      height: { duration: 0.3, ease: EASE },
      opacity: { duration: 0.25, ease: EASE },
      y: { duration: 0.25, ease: EASE },
    },
  },
  transition: {
    duration: 0.3,
    ease: EASE,
    opacity: { duration: 0.25 },
    y: { duration: 0.25 },
  },
};

// 侧边栏菜单容器动画
export const menuContainerVariants: Variants = {
  open: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
  closed: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
      when: 'afterChildren',
    },
  },
};

// 侧边栏菜单项动画
export const menuItemVariants: Variants = {
  open: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: EASE,
    },
  },
  closed: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: EASE,
    },
  },
};

// 箭头图标动画
export const chevronVariants = {
  expanded: {
    rotate: 180,
    transition: {
      duration: 0.3,
      ease: EASE,
    },
  },
  collapsed: {
    rotate: 0,
    transition: {
      duration: 0.3,
      ease: EASE,
    },
  },
};
