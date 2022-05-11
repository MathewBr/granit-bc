document.addEventListener('DOMContentLoaded', () => {
   paralax(document.getElementById('main'), 0.5);
   inpupFile(document.getElementById('exFile'));
   // let button = document.querySelector('button');
   buttonDownUp(document.querySelectorAll('button'));
   linksController(document.querySelectorAll('header a'));
});


function paralax(elem, speed) {
   if (!elem) return;
   if (getComputedStyle(elem).position === 'static') elem.style.position = 'relative';
   let backElem = document.createElement('div');
   backElem.style.cssText = `width: 100%; height: 100%; position: absolute; top: 0; z-index: -1; background: ${getComputedStyle(elem).background};`;
   elem.style.background = 'none';
   elem.style.overflow = 'hidden';
   elem.append(backElem);

   let observ = new ElemPosition(elem);
   observ.observer();
   //initially set offset to avoid jump at start of scrolling
   //maybe it's not needed
   backElem.style.transform = `translateY(${observ.domRect.top * speed * -1}px)`;

   window.addEventListener('scroll', () => {
      if (!observ.hidden) {
         backElem.style.transform = `translateY(${observ.domRect.top * speed * -1}px)`;
      }
   });
};

//object that contains actual metrics
class ElemPosition {
   constructor(elem) {
      this.elem = elem;
      this.domRect = elem.getBoundingClientRect();
      this.windHeight = document.documentElement.clientHeight;
      this.hidden = (this.domRect.top >= this.windHeight || this.domRect.bottom <= 0) ? true : false;
   }

   observer() {
      window.addEventListener('resize', () => {
         this.windHeight = document.documentElement.clientHeight;
         this.domRect = this.elem.getBoundingClientRect();
         this.isHidden();
      });

      window.addEventListener('scroll', () => {
         this.domRect = this.elem.getBoundingClientRect();
         this.isHidden();
      });
   }

   isHidden() {
      this.hidden = (this.domRect.top >= this.windHeight || this.domRect.bottom <= 0) ? true : false;
   }
}

function inpupFile(elem) {
   elem.addEventListener('change', (e) => {
      elem.parentElement.firstChild.data = e.target.value.split('\\').pop();
   });
}

function buttonDownUp(elems) {
   if (!elems) return;
   for (let elem of elems) {
      if (!elem) continue;
      elem.addEventListener('pointerdown', () => elem.classList.toggle('down'));
      elem.addEventListener('pointerup', () => elem.classList.toggle('down'));
   }
}
//
async function linksController(kit) {
   for (let a of kit) {
      a.addEventListener('click', async (e) => {
         e.preventDefault();

         /**
          * determine which page the click is on
          * if the attribute value is an anchor
          *       and we are on the home page, then rewind to find the element whose anchor is at the top with the specified offset
          *       if wea are not on the home page
          *             and there is no element with such an id on the page - message "change the href:value to the link for this element"
          *             if the elemtnt is there but it is hidden - show it and rewind
          * if the attribute value is an link, hide old content by assigning a sign of presence in the DOM
          *       check if it was loaded earlier, if there is a hidden
          *             if there is - display and rewind
          *             if not - start the download, show process, display, rewind
          */

         let page = window.location.href;
         // let page = window.location.pathname;
         let href = getHref(a);
         let offset = document.body.querySelector('header').clientHeight;
         let changing = document.getElementById('changing');
         let scroll = window.scrollY;

         if (whatTypeHref(href) == 'ancor') {
            let elem = document.getElementById(href.match(/\w+/));
            if (elem) {
               let position = elem.getBoundingClientRect().top + scroll - offset;
               animate({
                  duration: 1000,
                  draw: function draw(progress) {
                     let pos = position - scroll;
                     window.scrollTo(0, scroll + pos * progress);
                  },
                  timing: function circ(timeFraction) {
                     return 1 - Math.sin(Math.acos(timeFraction));
                  }
               });
            } else {
               if (changing.cash.loaded) {
                  hidden(changing).then(() => {
                     changing.innerHTML = changing.cash.oldContent;
                     changing.removeAttribute('data-status');
                     window.scrollTo(0, getPositionElem(changing, offset));
                  }).then(() => {
                     show(changing).then(() => {
                        buttonDownUp(document.querySelectorAll('button'));
                     });
                  })
               }
            }
         }
         if (whatTypeHref(href) == 'link') {
            // let changing = document.getElementById('changing');
            if (!changing.cash || !changing.cash.loaded) {
               let ancors = getAncorNewContent(a);
               let content = await getContent(href);
               let fragment = getFragment(content, '<body>', '</body>', false);
               let elems = ancors.map((elem) => {
                  return getElements(fragment, elem);
               });
               let newContent = document.createElement('div');
               elems.forEach(elem => {
                  newContent.append(elem);
               });
               cashContent(changing, changing.innerHTML, newContent.innerHTML);
            }
            if (changing.getAttribute('data-status') == 'loded') {
               let position = changing.getBoundingClientRect().top + scroll - offset;
               animate({
                  duration: 1000,
                  draw: function draw(progress) {
                     let pos = position - scroll;
                     window.scrollTo(0, scroll + pos * progress);
                  },
                  timing: function circ(timeFraction) {
                     return 1 - Math.sin(Math.acos(timeFraction));
                  }
               });
            } else {
               hidden(changing).then(() => {
                  changing.innerHTML = changing.cash.newContent;
                  changing.dataset.status = 'loded';
                  window.scrollTo(0, getPositionElem(changing, offset));
               }).then(() => {
                  show(changing).then(() => {
                     buttonDownUp(document.querySelectorAll('button'));
                  });
               });
            }
         }
      });
   };

   function cashContent(elem, oldContent, newContent) {
      elem.cash = {loaded: true, oldContent: oldContent, newContent: newContent};
   }

   function getHref(a) {
      if (a.tagName == 'A' && a.hasAttribute('href')) {
         return a.getAttribute('href');
      } else {
         console.log('fn-> getHref, element is not teg "a" or heve not attribute "href"')
      }
   }

   function getAncorNewContent(a) {
      if (a.dataset.newcontent) {
         let ancors = a.dataset.newcontent.split(' ');
         return ancors;
      } else {
         console.log(`fn-> getAncorContetn ${a} has not data-newcontent attribute`)
      }
   }

   function whatTypeHref(value) {
      return /^#.*/.test(value) ? 'ancor' : 'link';
   }

   function getContent(url) {
      return fetch(url).then(response => {
         if (response.ok) {
            return response.text();
         } else {
            console.log('request is failed in fn getContent ', response.status);
            return;
         }
      }).then(text => {
         return text;
      }).catch(err => console.log(err));
   }

   //get html fragment from tag to tag (inclusive - default true, without <script> - default true) looking for the first match
   function getFragment(str, from, to, inclusive = true, nosctipt = true) {
      let regexp = new RegExp(`${from}(.*?)${to}`, `s`);
      let without = /<script.*?>.*?<\/script>/gs;
      let fragment = str.match(regexp);
      if (!fragment) {
         console.log('fn-> getFragment, no matches');
         return;
      }
      if (inclusive === true) return nosctipt ? fragment[0].replace(without, '') : fragment[0];
      else return nosctipt ? fragment[1].replace(without, '') : fragment[1];
   }

   function getElements(bunch, selector) {
      let temp = document.createElement('div'); //temporary location to extract items
      temp.innerHTML = bunch;
      let element = temp.querySelector(`${selector}`);
      temp = '';
      return element;
   }

   function getPositionElem(elem, offset) {
      if (elem) {
         return elem.getBoundingClientRect().top + window.scrollY - offset;
      } else {
         return 0;
      }
   }
}

function animate({duration, draw, timing}) {
   let start = performance.now();
   requestAnimationFrame(function animate(time) {
      let timeFraction = (time - start) / duration;
      if (timeFraction > 1) timeFraction = 1;
      let progress = timing(timeFraction);
      draw(progress);
      if (timeFraction < 1) {
         requestAnimationFrame(animate);
      }
   });
}

function animatePromise({duration, draw, timing}) {
   return new Promise((resolve) => {
      let start = performance.now();
      requestAnimationFrame(function animate(time) {
         let timeFraction = (time - start) / duration;
         if (timeFraction > 1) timeFraction = 1;
         let progress = timing(timeFraction);
         draw(progress);
         if (timeFraction < 1) {
            requestAnimationFrame(animate);
         } else {
            resolve();
         }
      });
   })
}

function show(elem) {
   return animatePromise({
      duration: 400,
      draw: function draw(progress) {
         elem.style.opacity = progress;
      },
      timing: function circ(timeFraction) {
         return timeFraction;
      }
   })
}

function hidden(elem) {
   return animatePromise({
      duration: 400,
      draw: function draw(progress) {
         elem.style.opacity = 1 - progress;
      },
      timing: function circ(timeFraction) {
         return timeFraction;
      }
   });
}