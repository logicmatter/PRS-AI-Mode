import { Component, OnInit } from '@angular/core';
import { UserService } from '../PmCore/services/UserService/UserService.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html'
})
export class LayoutComponent implements OnInit {

  constructor(public userService: UserService) { }

  ngOnInit() {
  }
}
