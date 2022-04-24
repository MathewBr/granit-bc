document.addEventListener('DOMContentLoaded', () => {
   toggleClass('burg', 'active', 'noneActive', 'click');
});

// use three states: init, active, nonactive to avoid triggering the animation when the page is reloaded
function toggleClass(id, classActive, classNonActive, event) {
   let elem = document.getElementById(id);
   elem.addEventListener(event, () => {
      if (!elem.classList.contains(classActive) && !elem.classList.contains(classNonActive)) {
         elem.classList.add(classActive);
         return;
      }
      elem.classList.toggle(classActive);
      elem.classList.toggle(classNonActive);
   });
}
