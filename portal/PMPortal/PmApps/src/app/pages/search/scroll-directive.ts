import {Directive,HostListener,ElementRef} from '@angular/core'
@Directive(
  {
    selector:"[scrolledTo]",
    exportAs:"scrolledTo"
  }
)
export class ScrollDirective {

  showUpperOne=true;
  showLowerOne=false;
  constructor(private el:ElementRef){}
  @HostListener("window:scroll",['$event'])
  onScroll(){
    const elementPosition = this.el.nativeElement.offsetTop;
    const scrollPosition = window.pageYOffset;
    this.showUpperOne=scrollPosition<elementPosition
    this.showLowerOne = scrollPosition>= elementPosition;
  }
}
