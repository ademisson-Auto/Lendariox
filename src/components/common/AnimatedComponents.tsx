import * as React from 'react';
import { 
  View, 
  ScrollView, 
  FlatList, 
  Animated,
  ViewProps,
  ScrollViewProps,
  FlatListProps,
  ListRenderItem
} from 'react-native';

// Interfaces estendidas para os componentes animados
interface AnimatedViewProps extends Animated.AnimatedProps<ViewProps> {
  viewRef?: React.RefObject<View>;
}

interface AnimatedScrollViewProps extends Animated.AnimatedProps<ScrollViewProps> {
  scrollViewRef?: React.RefObject<ScrollView>;
}

interface AnimatedFlatListProps<T> extends Animated.AnimatedProps<FlatListProps<T>> {
  flatListRef?: React.RefObject<FlatList<T>>;
  renderItem: ListRenderItem<T>;
}

// Interface especial para View com key explícita
export interface KeyedViewProps extends ViewProps {
  itemKey?: string | number;
  children?: React.ReactNode;
}

// Componentes animados com tipagem explícita e suporte para refs
export const AnimatedView = React.forwardRef<View, AnimatedViewProps>((props, ref) => {
  const AView = Animated.createAnimatedComponent(View);
  return <AView {...props} ref={props.viewRef || ref} />;
});

export const AnimatedScrollView = React.forwardRef<ScrollView, AnimatedScrollViewProps>((props, ref) => {
  const AScrollView = Animated.createAnimatedComponent(ScrollView);
  return <AScrollView {...props} ref={props.scrollViewRef || ref} />;
});

export const AnimatedFlatList = React.forwardRef<FlatList<any>, AnimatedFlatListProps<any>>((props, ref) => {
  const AFlatList = Animated.createAnimatedComponent(FlatList);
  return <AFlatList {...props} ref={props.flatListRef || ref} />;
});

// Componente View especial que aceita key como itemKey
// Usando React.createElement em vez de JSX para contornar os problemas de tipagem
export const KeyedView: React.FC<KeyedViewProps> = ({ itemKey, children, ...props }) => {
  // Removemos a propriedade itemKey do objeto props antes de passá-la para o View
  const viewProps = { ...props } as ViewProps;
  
  // Usamos createElement para poder passar a key diretamente
  return React.createElement(
    View, 
    { 
      ...viewProps,
      key: itemKey 
    }, 
    children
  );
}; 