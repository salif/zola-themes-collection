let get_data = () => {
    add_loading();
    fetch('http://tushu.evai.pl/r')
        .then(res => {
            return res.json();
        })
        .then(data => {
            change_dom(data);
        })
}
let change_dom = (datas) => {
    let list = document.getElementById('list');
    list.innerHTML = '';
    datas.forEach(data => {
        let dom = `
        <a id="link" href="/${data.url}/">
        <h1>
            ${data.title}
        </h1>
        <div>${data.discription}</div>
        </a>
        `;
        list.innerHTML += dom;
    });
}

let add_loading=()=> {
    let list = document.getElementById('list');
    let dom = `<img id="loading" src="/loading.png"></img>`
    list.innerHTML=dom+list.innerHTML;
}

window.addEventListener('DOMContentLoaded', function () {
    get_data();
})