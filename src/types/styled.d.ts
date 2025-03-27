import 'react-native';

// Estender tipagens existentes e ajustar interfaces que têm conflitos
declare module 'react-native' {
  // Aqui podemos estender ou substituir tipagens que estão causando conflitos
}

// Resolver conflitos com o Animated API
declare module 'react-native/Libraries/Animated/Animated' {
  interface AnimatedProps<T> extends T {}
}

// Tipagem para o componente LinearGradient do Expo
declare module 'expo-linear-gradient' {
  import { ViewProps } from 'react-native';
  import { Component } from 'react';

  export interface LinearGradientProps extends ViewProps {
    colors: string[];
    start?: { x: number; y: number };
    end?: { x: number; y: number };
    locations?: number[];
  }

  export default class LinearGradient extends Component<LinearGradientProps> {}
}

// Resolver conflitos com tipos DOM
interface FormData {}
interface URL {}
interface URLSearchParams {}
interface RequestInfo {}
interface XMLHttpRequestResponseType {}
interface AbortSignal {} 