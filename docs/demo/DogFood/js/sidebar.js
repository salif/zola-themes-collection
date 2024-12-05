const openSidebar = () => {
  document.getElementsByName('header')[0].classList.add('with_sidebar')
  document.getElementsByName('footer')[0].classList.add('with_sidebar')
  document.getElementsByName('main')[0].classList.add('with_sidebar')
  document.getElementsByName('sidebar')[0].classList.add('with_sidebar')
  document.getElementsByClassName('sidebar-toggle')[0].onclick = closeSidebar
  document.getElementsByClassName('sidebar-toggle')[0].childNodes[0].nodeValue = 'X'
}

const closeSidebar = () => {
  document.getElementsByName('header')[0].classList.remove('with_sidebar')
  document.getElementsByName('footer')[0].classList.remove('with_sidebar')
  document.getElementsByName('main')[0].classList.remove('with_sidebar')
  document.getElementsByName('sidebar')[0].classList.remove('with_sidebar')
  document.getElementsByClassName('sidebar-toggle')[0].onclick = openSidebar
  document.getElementsByClassName('sidebar-toggle')[0].childNodes[0].nodeValue = 'O'
}

const switchToTOC = () => {
  document.getElementsByName("swith-to-toc-button")[0].classList.add("actived")
  document.getElementsByName("swith-to-about-authour-button")[0].classList.remove("actived")
  document.getElementsByClassName("sidebar-overview")[0].style.opacity = '0'
  document.getElementsByClassName("sidebar-toc")[0].style.opacity = '1'
  document.getElementsByClassName("sidebar-overview")[0].style.display = 'none'
  document.getElementsByClassName("sidebar-toc")[0].style.display = 'block'
}

const switchToAboutAuthor = () => {
  document.getElementsByName("swith-to-toc-button")[0].classList.remove("actived")
  document.getElementsByName("swith-to-about-authour-button")[0].classList.add("actived")
  document.getElementsByClassName("sidebar-overview")[0].style.opacity = '1'
  document.getElementsByClassName("sidebar-toc")[0].style.opacity = '0'
  document.getElementsByClassName("sidebar-overview")[0].style.display = 'block'
  document.getElementsByClassName("sidebar-toc")[0].style.display = 'none'
}