import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiPath} from '../http/api-path';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly httpClient = inject(HttpClient);

  public deleteUser(): Observable<void> {
    return this.httpClient.delete<void>(ApiPath.user.delete)
  }
}
