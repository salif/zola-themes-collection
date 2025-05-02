document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.copy-button').forEach(function(button) {
        button.addEventListener('click', function() {
            var codeBlock = button.closest('.code-container').querySelector('code');
            if (codeBlock) {
                var codeText = codeBlock.innerHTML;
                navigator.clipboard.writeText(codeText).then(function() {
                    var originalText = button.innerHTML;
                    button.innerHTML = '<i class="fa fa-copy"> Copied ! </i>'; // 更改按鈕文字
                    setTimeout(function() {
                        button.innerHTML = originalText; // 幾秒後恢復原文字
                    }, 2000); // 2000 毫秒 = 2 秒
                }).catch(function(err) {
                    button.innerHTML = '<i class="fa fa-copy"> Error ! </i>!';
                });
            }
        });
    });
});