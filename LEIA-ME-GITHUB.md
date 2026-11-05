# StudyFlow: gerar o APK com GitHub Actions

## Passo a passo
1. Crie um repositório no GitHub (pode ser privado).
2. Envie **o conteúdo desta pasta** para a raiz do repositório (`package.json`, `.github/`, `index.html`...). Na web: Add file > Upload files, arrastando tudo, **incluindo a pasta oculta `.github`**. Se ela não aparecer ao arrastar, use o Git:
   ```
   git init && git add . && git commit -m "StudyFlow v1"
   git branch -M main && git remote add origin URL_DO_REPOSITORIO && git push -u origin main
   ```
3. Abra a aba **Actions**: o workflow **Build APK** roda sozinho a cada push na `main` (leva uns 5 a 10 minutos).
4. Ao terminar, abra a execução e baixe o artefato **StudyFlow-apk** (ZIP com `StudyFlow-debug.apk`).
5. No celular, instale o APK (Android pede para permitir instalação de fontes desconhecidas).

Para rodar manualmente: Actions > Build APK > Run workflow.

## Antes de publicar
- Em `capacitor.config.json`, troque `com.studyflow.app` pelo seu pacote (ex.: `com.seunome.studyflow`). Depois de publicado, não dá para trocar.
- O número de versão sobe sozinho a cada execução.

## APK assinado (release)
O APK de debug serve para instalar e testar. Para um APK assinado com sua chave:
1. Gere a chave (guarde o arquivo e as senhas em local seguro, sem ela você não atualiza o app):
   ```
   keytool -genkeypair -v -keystore studyflow.jks -alias studyflow -keyalg RSA -keysize 2048 -validity 10000
   base64 -w0 studyflow.jks      # no Mac: base64 -i studyflow.jks
   ```
2. No GitHub: Settings > Secrets and variables > Actions > New repository secret. Crie:
   `KEYSTORE_BASE64` (saída do base64), `KEYSTORE_PASSWORD`, `KEY_ALIAS` (ex.: studyflow) e `KEY_PASSWORD`.
3. A próxima execução gera também `StudyFlow-release.apk`.

## Release com download direto
Crie uma tag de versão e o APK é anexado automaticamente à página de Releases:
```
git tag v1.0.0 && git push origin v1.0.0
```

## O que já vem configurado no app
- Ícone do app e ícone adaptativo do Android (pasta `android-res/`, copiada no build).
- Exportar dados abre o compartilhamento do Android (Filesystem e Share).
- Botão voltar do Android navega entre as telas e só sai do app na tela inicial.

## Limites
- A Play Store exige pacote **AAB**; este workflow gera APK. Posso acrescentar o AAB depois.
- Lembretes: no app, abra Perfil > engrenagem > **Ativar lembretes** e permita as notificações. Se o Android atrasar os avisos, desative a otimização de bateria do StudyFlow nas configurações do aparelho.
- Não consegui executar o workflow aqui, então a primeira execução pode pedir ajustes. Se falhar, copie o log do erro e me envie.
