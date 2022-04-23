document.addEventListener('DOMContentLoaded', () => {
   toggleClass('burg', 'active', 'click');
});

function toggleClass(id, classElem, event) {
   let elem = document.getElementById(id);
   elem.addEventListener(event, () => {
      elem.classList.toggle(classElem);
   });
}