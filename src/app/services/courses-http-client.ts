import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, throwError } from 'rxjs';
import { CourseInterface } from '../models/CourseInterface';
import { LanguageInterface } from '../models/LanguageInterface';
import { LevelInterface } from '../models/LevelInterface';
import { UserInterface } from '../models/UserInterface';
import { TeacherInterface } from '../models/TeacherInterface';

type ProfilePictureUploadMode = 'cloudinary';

const PROFILE_PICTURE_UPLOAD_MODE: ProfilePictureUploadMode = 'cloudinary';

const CLOUDINARY_CLOUD_NAME = 'dnywbqedv';
const CLOUDINARY_UPLOAD_PRESET = 'Speakly';

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
    updateUser(user: UserInterface) {
        return this.Mihttp.put<UserInterface>(`${this.urlUsers}/me`, user);
    }

    uploadProfilePicture(file: File) {
        if (PROFILE_PICTURE_UPLOAD_MODE !== 'cloudinary') {
            return throwError(() => new Error('Modo de subida no soportado.'));
        }

        if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
            return throwError(() => new Error('Falta configurar CLOUDINARY_CLOUD_NAME y CLOUDINARY_UPLOAD_PRESET.'));
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const cloudName = CLOUDINARY_CLOUD_NAME.trim().toLowerCase();
        const url = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`;

        return this.Mihttp.post<any>(url, formData).pipe(
            map((res) => {
                const uploadedUrl = res?.secure_url ?? res?.url;
                if (typeof uploadedUrl !== 'string' || !uploadedUrl.trim().length) {
                    throw new Error('Respuesta inesperada al subir la imagen.');
                }
                return uploadedUrl as string;
            })
        );
    }

}
