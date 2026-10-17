import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiPath} from '../http/api-path';
import {UserRequest, UserResponse} from './user-types';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly httpClient = inject(HttpClient);

  public deleteUser(): Observable<void> {
    return this.httpClient.delete<void>(ApiPath.user.delete);
  }

  public patchUser(userRequest: UserRequest): Observable<UserResponse> {
    return this.httpClient.patch<UserResponse>(ApiPath.user.patch, userRequest);
  }

  public getUser(): Observable<UserResponse> {
    return this.httpClient.get<UserResponse>(ApiPath.user.get);
  }
}
