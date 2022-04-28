document.addEventListener('DOMContentLoaded', () => {
   toggleClass('burg', 'active', 'noneActive', 'click');
   activeBlock(document.getElementById('modifiable'), document.getElementById('burg'));
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

//use three states: init, active, nonactive. main work though css classes
function activeBlock(block, trigger) {
   if (getComputedStyle(document.body).position === 'static') document.body.style.position = 'relative';
   block.place = getPlaceElem(block);
   // console.log(block.place);
   let wrap;
   trigger.addEventListener('click', () => {
      if (trigger.classList.contains('active')) {
         wrap = document.createElement('div');
         wrap.classList.add('globWrap'); //set styles for div.globWrap in css
         block.classList.add('active');
         wrap.append(block);
         document.body.append(wrap);
         setBodyOverflow('h');
      };
      if (trigger.classList.contains('noneActive')) {
         block.classList.remove('active');
         block.classList.add('noneActive');

         //delete after transformation or animation
         block.addEventListener('animationend', (event) => {
            event.stopPropagation();
            //event fires multiple times
            if (block.classList.contains('noneActive')) {
               // setTimeout(() => {
               block.classList.remove('noneActive');
               //remove the class here to avoid triggering the animation
               trigger.classList.remove('noneActive');
               block.place(block);
               wrap.remove();
               setBodyOverflow('v');
               // }, 0);
            }
         });
      };
   });
}

function getPlaceElem(elem) {
   let node;
   if (elem.nextElementSibling) {
      node = elem.nextElementSibling;
      return node.before.bind(node);
   } else if (elem.previousElementSibling) {
      node = elem.previousElementSibling;
      return node.after.bind(node);
   } else {
      node = elem.parentElement;
      return node.append.bind(node);
   }
}

function setBodyOverflow(type) { //'h' - hidden, 'v' - visible
   let currentWidth = document.body.clientWidth;
   let diff = 0;
   switch (type) {
      case 'h':
         document.body.style.overflow = 'hidden';
         diff = document.body.clientWidth - currentWidth;
         if (diff > 0) document.body.style.paddingRight = diff + 'px';
         break;
      case 'v':
         document.body.style.overflow = '';
         diff = document.body.clientWidth - currentWidth;
         if (diff < 0) document.body.style.paddingRight = '';
         break;
      default:
         console.log('please, set argument either "h" or "v" in function setBogyOverflow')
   }
}