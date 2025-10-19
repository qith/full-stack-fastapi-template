import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { useColorModeValue } from '@/components/ui/color-mode'
import { muiTheme, muiDarkTheme } from '@/theme/mui-theme'

interface MUIThemeProviderProps {
  children: React.ReactNode
}

export const MUIThemeProvider = ({ children }: MUIThemeProviderProps) => {
  // 使用 useColorModeValue 来根据主题选择 Material UI 主题
  const muiThemeToUse = useColorModeValue(muiTheme, muiDarkTheme)

  return (
    <ThemeProvider theme={muiThemeToUse}>
      <CssBaseline />
      <div className="mui-scope">
        {children}
      </div>
    </ThemeProvider>
  )
}
