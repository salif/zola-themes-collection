document.addEventListener('DOMContentLoaded', () => {
    // 選取所有具有 'audio-player' class 的音訊元素
    const audioPlayers = document.querySelectorAll('.audio-player');
    // 遍歷每一個音訊播放器
    audioPlayers.forEach(audioPlayer => {
        // 找到緊跟在當前音訊播放器後面的字幕顯示區域
        // 這裡假設字幕顯示 div 緊跟在 audio 標籤後面，並且有 'subtitle-display' class
        const subtitleDisplay = audioPlayer.nextElementSibling;
        // 使用 let 宣告 activeTextTrack，使其在迴圈的當前作用域內可被 setupSubtitles 和 timeupdate 存取及修改
        let activeTextTrack = null;

        // --- 函式：用於尋找和設定字幕軌及 cue ---
        const setupSubtitles = () => {
            // 在開始設定前，確保 activeTextTrack 是 null，準備重新尋找
            activeTextTrack = null;

            // 步驟 1: 檢查 audioPlayer 是否有 textTracks 屬性且不為空
            if (audioPlayer.textTracks && audioPlayer.textTracks.length > 0) {
                let foundSubtitleTrack = null;
                // 步驟 2: 遍歷 textTracks 列表，尋找 kind 為 "subtitles" 的軌道
                for (let i = 0; i < audioPlayer.textTracks.length; i++) {
                    const track = audioPlayer.textTracks[i];
                    if (track.kind === 'subtitles') {
                        foundSubtitleTrack = track;
                        break; // 找到第一個字幕軌就使用
                    }
                }

                // 步驟 3: 檢查是否找到了字幕軌
                if (foundSubtitleTrack) {
                    activeTextTrack = foundSubtitleTrack; // 將找到的軌道指定給 activeTextTrack

                    // 步驟 4: 設定軌道模式為 'showing'
                    activeTextTrack.mode = 'showing';
                }
            }
            // 無論成功與否，根據最終 activeTextTrack 和 cues 的狀態來清空字幕顯示區域
            if ((!activeTextTrack || !activeTextTrack.cues || activeTextTrack.cues.length === 0) && subtitleDisplay && subtitleDisplay.classList.contains('subtitle-display')) {
                subtitleDisplay.textContent = '';
            }
        };
        // --- 綁定事件監聽器 ---

        // 當音訊的元資料（包括 textTracks）載入完成後觸發
        // 或者當瀏覽器判斷可以開始播放時觸發
        // 我們同時監聽 loadeddata 和 canplay，並在任一事件觸發時執行 setupSubtitles
        // 也可以只依賴 readyState 檢查
        audioPlayer.addEventListener('loadeddata', () => {
            setupSubtitles(); // 執行字幕設定
        });

        // 監聽音訊播放器錯誤
        audioPlayer.addEventListener('error', (e) => {
            // 發生錯誤時清空字幕顯示
            if (subtitleDisplay && subtitleDisplay.classList.contains('subtitle-display')) {
                subtitleDisplay.textContent = '音訊載入或播放錯誤。';
            }
        });


        // 每當當前播放器的播放時間更新時觸發
        audioPlayer.addEventListener('timeupdate', () => {
            // 呼叫更新字幕的函式，傳入當前播放器、其對應的字幕顯示區域和活躍的字幕軌
            // 這裡我們檢查 subtitleDisplay 是否存在，避免在找不到對應元素時報錯
            if (subtitleDisplay && subtitleDisplay.classList.contains('subtitle-display')) {
                updateSubtitleDisplay(audioPlayer, subtitleDisplay, activeTextTrack);
            }
        });

        // 音訊播放結束時清空字幕
        audioPlayer.addEventListener('ended', () => {
            if (subtitleDisplay && subtitleDisplay.classList.contains('subtitle-display')) {
                subtitleDisplay.textContent = '';
            }
        });

        // --- 檢查 readyState 並在必要時立即執行 setupSubtitles ---
        // 如果腳本執行時，媒體的 readyState 已經達到或超過 HAVE_CURRENT_DATA (2)，
        // 表示 loadeddata 或 canplay 事件可能已經觸發或即將觸發。
        // 為避免錯過事件，我們直接檢查並執行 setupSubtitles。
        // >= 2 表示至少音訊的當前播放位置和持續時間信息已經載入。
        if (audioPlayer.readyState >= 2) {
            setupSubtitles();
        }
    });

    // --- 函式：更新字幕顯示區域的內容 ---
    // 這個函式定義在 forEach 迴圈外面，但被迴圈內的 timeupdate 事件呼叫
    // 接收當前播放器、字幕顯示區域和活躍的字幕軌作為參數
    function updateSubtitleDisplay(audioPlayer, subtitleDisplay, activeTextTrack) {
        // 確保有活躍的字幕軌、cue 列表不為空，並且有可用的字幕顯示區域
        if (!activeTextTrack || !activeTextTrack.cues || !subtitleDisplay || !subtitleDisplay.classList.contains('subtitle-display')) {
            // 如果條件不符，確保字幕顯示區域是空的
            if (subtitleDisplay && subtitleDisplay.classList.contains('subtitle-display')) {
                subtitleDisplay.textContent = '';
            }
            return;
        }

        let currentSubtitle = '';
        // 遍歷當前播放器字幕軌的所有 cue (字幕片段)
        for (let i = 0; i < activeTextTrack.cues.length; i++) {
            const cue = activeTextTrack.cues[i];
            // 檢查當前播放時間是否落在 cue 的開始和結束時間之間
            if (audioPlayer.currentTime >= cue.startTime && audioPlayer.currentTime < cue.endTime) {
                currentSubtitle = cue.text; // 如果是，則設定為當前字幕
                break; // 找到後即可退出迴圈
            }
        }
        // 更新對應字幕顯示區域的內容
        subtitleDisplay.textContent = currentSubtitle;

        // 如果 currentSubtitle 是空的（表示當前時間沒有對應的 cue），也清空顯示
        if (currentSubtitle === '') {
            subtitleDisplay.textContent = '';
        }
    }
});

