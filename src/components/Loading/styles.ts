import theme from '@theme/index';
import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;

  background-color: ${theme.COLORS.GRAY_800};
`;

export const LoadIndicator = styled.ActivityIndicator.attrs({
  color: theme.COLORS.BRAND_LIGHT,
})``;
