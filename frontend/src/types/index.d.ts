// 全局类型声明
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.bmp';
declare module '*.tiff';

// 组件模块声明
declare module '../../components/layouts/MainLayout' {
  import { FC, ReactNode } from 'react';
  
  interface MainLayoutProps {
    children: ReactNode;
  }
  
  const MainLayout: FC<MainLayoutProps>;
  export default MainLayout;
}

declare module '../../components/categories/CategoryForm' {
  import { FC } from 'react';
  import { Category } from '../../services/categories';
  
  interface CategoryFormProps {
    category?: Category | null;
    onSuccess: () => void;
    onCancel: () => void;
  }
  
  const CategoryForm: FC<CategoryFormProps>;
  export default CategoryForm;
}

declare module '../../components/favorites/FavoriteForm' {
  import { FC } from 'react';
  import { Favorite } from '../../services/favorites';
  
  interface FavoriteFormProps {
    favorite?: Favorite | null;
    onSuccess: () => void;
    onCancel: () => void;
  }
  
  const FavoriteForm: FC<FavoriteFormProps>;
  export default FavoriteForm;
}

declare module '../../components/prompts/PromptCard' {
  import { FC } from 'react';
  
  interface PromptCardProps {
    prompt: any;
    showActions?: boolean;
  }
  
  const PromptCard: FC<PromptCardProps>;
  export default PromptCard;
}
