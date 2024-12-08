function setScrollTop() {
    window.scrollTo(0, 0);
}
function loadCSS(url) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url;

    document.head.appendChild(link);

    link.onload = function () {
        console.log('Stylesheet loaded successfully.');
    };

}

document.addEventListener('DOMContentLoaded', function () {
    // var brElements = document.getElementsByTagName('br');
    // console.log(brElements.length)
    // if (brElements.length<=200) loadCSS('/page-patch.css');
    var htmlContent = document.body.innerHTML; // 获取HTML内容
    var regex = /<br><br>/g; // 创建正则表达式来匹配连续的两个<br>标签

    if (regex.test(htmlContent)) {
        console.log('存在两个相邻的<br>标签');
    } else {
        console.log('没有找到两个相邻的<br>标签');
        loadCSS('/page-patch.css');
    }
});

