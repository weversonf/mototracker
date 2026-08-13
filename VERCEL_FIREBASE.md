# MotoPulse na Vercel com login Google

O frontend usa Firebase Authentication exclusivamente para o acesso com Google. A configuração do Firebase é lida por variáveis `VITE_FIREBASE_*` e não fica embutida em componentes React.

## Firebase

No Firebase Console do projeto `drivo-e-money`, ative **Authentication → Sign-in method → Google**. Em **Authentication → Settings → Authorized domains**, inclua o domínio gerado pela Vercel e qualquer domínio personalizado que venha a ser usado.

## Vercel

Ao importar o repositório, use o comando `pnpm build`. Como este projeto usa Vite com a raiz em `client`, o diretório de saída do frontend é `dist/public`. Cadastre as seis variáveis abaixo no ambiente de produção, preview e desenvolvimento conforme necessário:

| Variável | Origem |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | `apiKey` da configuração Web |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | `appId` |

O arquivo `.env.local` é usado apenas no ambiente local e está ignorado pelo Git. Não coloque service accounts, chaves privadas ou credenciais administrativas no frontend.

