import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3a86ff',
    },
    secondary: {
      main: '#ff006e',
    },
    success: {
      main: '#00916e',
    },
    warning: {
      main: '#ffbe0b',
    },
    error: {
      main: '#fb5607',
    },
    info: {
      main: '#52d1dc',
    },
    background: {
      default: '#fcfcfc',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'Oxygen',
      'Ubuntu',
      'Cantarell',
      '"Fira Sans"',
      '"Droid Sans"',
      '"Helvetica Neue"',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 4,
        },
      },
    },
  },
});

export default theme;
