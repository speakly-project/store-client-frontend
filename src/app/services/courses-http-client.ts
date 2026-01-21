import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { CourseInterface } from '../models/CourseInterface';
import { LanguageInterface } from '../models/LanguageInterface';
import { LevelInterface } from '../models/LevelInterface';
import { UserInterface } from '../models/UserInterface';
import { TeacherInterface } from '../models/TeacherInterface';

@Injectable({
    providedIn: 'root'
})
export class CoursesHttpClient {

    constructor(private Mihttp: HttpClient) { }

    urlCourses = "http://localhost:8080/api/speakly/courses";
    urlCoursesWithTeachers = "http://localhost:8080/api/speakly/courses/with-teachers";
    urlLanguages = "http://localhost:8080/api/speakly/languages";
    urlLevels = "http://localhost:8080/api/speakly/levels";
    urlUsers = "http://localhost:8080/api/speakly/users";


    getAllCourses() {
        return this.Mihttp.get<{ data: CourseInterface[] }>(this.urlCourses + `?pageSize=100`).pipe(
            map(response => response.data)
        );
    }
    getAllCoursesWithTeachers() {
        return this.Mihttp.get<{ data: CourseInterface[] }>(this.urlCoursesWithTeachers + `?pageSize=100`).pipe(
            map(response => response.data)
        );
    }
    getCourseById(id: number) {
        return this.Mihttp.get(this.urlCourses + '/' + id);
    }
    // deleteCourse(id: number) {
    //     return this.Mihttp.delete(this.urlCourses + '/' + id);
    // }
    // updateCourse(id: number, course: any) {
    //     return this.Mihttp.put(this.urlCourses + '/' + id, course);
    // }
    // createCourse(course: any) {
    //     return this.Mihttp.post(this.urlCourses, course);
    // }
    getAllLanguages() {
        return this.Mihttp.get<{ data: LanguageInterface[] }>(this.urlLanguages + `?pageSize=100`).pipe(
            map(response => response.data)
        );
    }
    getAllLevels() {
        return this.Mihttp.get<{ data: LevelInterface[] }>(this.urlLevels + `?pageSize=100`).pipe(
            map(response => response.data)
        );
    }
    getAllTeachers() {
        return this.Mihttp.get<{ data: TeacherInterface[] }>(this.urlUsers + `?pageSize=100`).pipe(
            map(response => response.data)
        );
    }
    getUserById(userId: number) {
        return this.Mihttp.get<UserInterface>(`${this.urlUsers}/${userId}`);
    }
    getUserByUsername(username: string) {
        return this.Mihttp.get<UserInterface>(`${this.urlUsers}/username?username=${username}`);
    }
    getAllUsers() {
        return this.Mihttp.get<{ data: UserInterface[] }>(`${this.urlUsers}?pageSize=100`).pipe(
            map(response => response.data)
        );
    }

    createUser(user: UserInterface) {
        return this.Mihttp.post(this.urlUsers, user);
    }
    updateUser(id: number, user: UserInterface) {
        return this.Mihttp.put(`${this.urlUsers}/${id}`, user);
    }

}
