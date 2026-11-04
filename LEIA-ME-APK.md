# StudyFlow V1: como gerar o APK

O app é 100% HTML, CSS e JavaScript. Os dados ficam no aparelho (LocalStorage) e tudo funciona offline.
Ícones prontos em `assets/icons/` (192, 512 e maskable), `manifest.json` configurado e `sw.js` para uso offline.

## Antes de tudo
1. Abra `index.html` no navegador do celular e teste todas as telas.
2. Escolha o nome do pacote (ex.: `com.seunome.studyflow`). Depois de publicado, não dá para trocar.

## Caminho A: conversor online (mais rápido)
Serviços como WebIntoApp, Appilix ou Median aceitam o `studyflow.zip` ou uma URL.
- Envie o ZIP, informe nome e ícone (`assets/icons/icon-512.png`) e baixe o APK.
- Ative upload de arquivos, para a foto de perfil e das matérias.

## Caminho B: PWABuilder (APK assinado)
1. Hospede a pasta em HTTPS (GitHub Pages, Netlify ou Vercel, todos gratuitos).
2. Em pwabuilder.com, informe a URL, clique em Package for stores > Android.
3. Baixe o pacote. Guarde o arquivo de chave (keystore) em local seguro: sem ele você não atualiza o app.

## Caminho C: Capacitor + Android Studio (mais controle)
Requer Node.js e Android Studio instalados.
```
npm install
npm run prep
npx cap add android
npx cap sync
npx cap open android
```
No Android Studio: Build > Build Bundle(s) / APK(s) > Build APK(s).
Para publicar na Play Store, use Build > Generate Signed Bundle (AAB).

## Pontos de atenção em Android
- **Exportar dados (JSON):** o download por link pode não funcionar em WebView. Com Capacitor, use os plugins Filesystem e Share.
- **Notificações:** em WebView são limitadas. Para alertas confiáveis do Pomodoro, use o plugin Local Notifications.
- **Botão voltar:** por padrão fecha o app. Com Capacitor, o plugin App permite tratar o botão.
- **Backup:** desinstalar o app apaga os dados. Oriente o uso de Exportar dados.
