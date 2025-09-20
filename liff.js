// DOMが読み込まれたら処理を開始
document.addEventListener('DOMContentLoaded', () => {
    main();
});

async function main() {
    // ステータスメッセージを更新
    const statusElement = document.getElementById('status');
    statusElement.textContent = "LIFFアプリを初期化中...";

    // 1. LIFFを初期化
    // 【重要】'YOUR_LIFF_ID' は後で自分のLIFF IDに書き換える
    await liff.init({ liffId: 'YOUR_LIFF_ID' }).catch(err => {
        console.error(err);
        statusElement.textContent = "LIFFの初期化に失敗しました。";
        return;
    });

    // 2. ログインしているか確認
    if (!liff.isLoggedIn()) {
        statusElement.textContent = "LINEにログインしてください。";
        // ログインしていなければ、ログインページにリダイレクト
        liff.login(); 
        return;
    }

    // 3. ユーザーのプロフィール情報を取得
    statusElement.textContent = "プロフィール情報を取得中...";
    const profile = await liff.getProfile().catch(err => {
        console.error(err);
        statusElement.textContent = "プロフィール情報の取得に失敗しました。";
        return;
    });

    // 4. バックエンド（GAS）にデータを送信
    statusElement.textContent = "サーバーに情報を送信中...";
    const gasWebAppUrl = 'YOUR_GAS_WEB_APP_URL'; // 【重要】ステップ1でコピーしたGASのURLに書き換える

    const postData = {
        userId: profile.userId,
        displayName: profile.displayName
    };

    try {
        const response = await fetch(gasWebAppUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8', // GASで受け取るための設定
            },
            body: JSON.stringify(postData)
        });

        const result = await response.json();

        if (result.status === 'success') {
            statusElement.textContent = `✅ ${profile.displayName}さん、チェックイン完了です！`;
            // チェックインが完了したら、自動でLIFFを閉じる
            liff.closeWindow();
        } else {
            statusElement.textContent = `❌ エラー: ${result.message}`;
        }

    } catch (error) {
        console.error('Fetch Error:', error);
        statusElement.textContent = "サーバーへの送信に失敗しました。";
    }
}