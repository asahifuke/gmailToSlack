# GmailToSlack
Gmailに送られた画像をslackに送信するライブラリ

## なぜこれを作ろうと思ったかというと
私は、フィヨルドブートキャンプの領収書と請求書を会社の人事に送る必要があります。
私は、「Gmailを開いて、画像をダウンロードして、Slackにアップロードしてに送信することに手間がかる。」
「送信自体を忘れてしまったりして、人事の方にご迷惑をかけてしまっている」
ことに課題感を感じていました。
そこで、本プログラムを実装して、自動化することで、課題を解決しようと試みました。

## インストール方法
### Gmail Access Token取得方法
以下のURLの初めから5分00秒のところまでを行なってください。
そのとき、取得したい画像があるGmailのGoogleアカウントで行なってください。
そのとき、ダウンロードしたcredentials.jsonを適当なところに配置してください。
https://youtu.be/L4BH1sDRpaQ?t=299

### SlackAPIAccessTokenの取得方法

[ここ](https://api.slack.com/)にアクセス
![](/images/2.png) 
赤丸のボタンをクリック

![](/images/3.png) 
新しいアプリを作成する

![](/images/4.png) 
名前とワークスペースを作成する

![](/images/5.png) 
パーミッションを追加していきます

![](/images/6.png) 
「chat：write」、「File：write」のスコープを追加していきます。

![](/images/7.png) 
追加した様子

![](/images/9.png) 
スコープ追加後、ワークスペースにインストールしていきます。

![](/images/8.png) 
許可します。

![](/images/12.png) 
OAth keyをコピーしておきます。※１

![](/images/10.png) 
アプリを追加するをクリックします。

![](/images/11.png) 
インストールしたアプリをワークスペースに追加します

## 使い方
- npmをインストール
```
npm i gmailtoslack
```

```
./gmail.js フィヨルドブートキャンプからの領収書 [slackのチャンネル名] [slackに送信するメッセージ] [Gmail Access Token取得方法のところでダウンロードしたcredentials.jsonの絶対パス] [Slack API Access Token の取得方法の※１で取得したOAth key]
```

![](/images/13.png) 
Gmail APIを取得したアカウントでサインインしてください。

![](/images/14.png) 
赤丸の部分をクリックしてください。

![](/images/15.png) 
続行をクリックしてください。

![](/images/16.png) 
以下のようになればGmailの認証は成功です。

これで、指定しているチャンネルに画像が送信されます。

