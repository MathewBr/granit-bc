document.addEventListener('DOMContentLoaded', () => {
   paralax(document.getElementById('main'), 0.5);

});


function paralax(elem, speed) {
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


