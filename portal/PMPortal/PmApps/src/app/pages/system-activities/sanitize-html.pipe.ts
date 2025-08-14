import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
var sanitizeHtml = "";

@Pipe({ name: 'sanitizeHtml' })
export class sanitizeHtmlPipe implements PipeTransform {

    constructor(private _sanitizer: DomSanitizer) { }

    transform(value: string): SafeHtml {
        var sanitizeHtml = "<p></p>";
        return this._sanitizer.bypassSecurityTrustHtml(value);
    }
}
