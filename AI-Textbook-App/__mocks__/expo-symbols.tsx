import React from 'react';
import { View } from 'react-native';

export type SymbolViewProps = {
  name: string;
  weight?: 'regular' | 'bold';
  tintColor?: string;
  resizeMode?: string;
  style?: any;
};

export type SymbolWeight = 'regular' | 'bold';

export const SymbolView: React.FC<SymbolViewProps> = (props) => {
  return <View testID="symbol-view" {...props} />;
};
