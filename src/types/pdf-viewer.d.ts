declare module 'react-native-pdf' {
  import { Component } from 'react';
  import { StyleProp, ViewStyle } from 'react-native';

  export interface PDFProps {
    source: {
      uri?: string;
      cache?: boolean;
      headers?: Record<string, string>;
    };
    page?: number;
    scale?: number;
    minScale?: number;
    maxScale?: number;
    horizontal?: boolean;
    spacing?: number;
    password?: string;
    style?: StyleProp<ViewStyle>;
    activityIndicator?: React.ReactNode;
    activityIndicatorProps?: any;
    enableAntialiasing?: boolean;
    enableAnnotationRendering?: boolean;
    enablePaging?: boolean;
    enableRTL?: boolean;
    fitPolicy?: number;
    trustAllCerts?: boolean;
    onLoadComplete?: (numberOfPages: number, path: string) => void;
    onLoadProgress?: (percent: number) => void;
    onLoadError?: (error: any) => void;
    onPageChanged?: (page: number, numberOfPages: number) => void;
    onPageSingleTap?: (page: number) => void;
    onScaleChanged?: (scale: number) => void;
    onError?: (error: any) => void;
    renderActivityIndicator?: (progress: number) => React.ReactNode;
  }

  export default class Pdf extends Component<PDFProps> {}
} 