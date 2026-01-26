import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, throwError } from 'rxjs';
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


    getCourses(params?: { 
        language?: string; 
        level?: string; 
        minPrice?: number; 
        maxPrice?: number; 
        sortBy?: string; 
        pageNumber?: number; 
        pageSize?: number 
    }): Observable<{ data: CourseInterface[]; totalElements?: number; totalPages?: number; pageNumber?: number; pageSize?: number; }> {
        const queryParams = new URLSearchParams();
        
        if (params?.language) queryParams.append('language', params.language);
        if (params?.level) queryParams.append('level', params.level);
        if (params?.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
        if (params?.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());
        if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
        queryParams.append('pageNumber', (params?.pageNumber ?? 1).toString());
        queryParams.append('pageSize', (params?.pageSize ?? 15).toString());
        
        const url = `${this.urlCourses}?${queryParams.toString()}`;
        return this.Mihttp.get<{ data: CourseInterface[]; totalElements?: number; totalPages?: number; pageNumber?: number; pageSize?: number; }>(url).pipe(
            map(response => ({
                data: response?.data ?? [],
                totalElements: response?.totalElements ?? undefined,
                totalPages: response?.totalPages ?? undefined,
                pageNumber: response?.pageNumber ?? undefined,
                pageSize: response?.pageSize ?? undefined,
            }))
        );
    }

    getAllCourses(): Observable<CourseInterface[]> {
        return this.getCourses({ pageSize: 100 }).pipe(map(res => res.data));
    }

    getAllCoursesWithTeachers(): Observable<CourseInterface[]> {
        return this.Mihttp.get<{ data: CourseInterface[] }>(`${this.urlCoursesWithTeachers}?pageSize=100`).pipe(
            map(response => response.data || [])
        );
    }

    getCourseById(id: number): Observable<CourseInterface> {
        return this.Mihttp.get<CourseInterface>(`${this.urlCourses}/${id}`);
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
    getAllLanguages(): Observable<LanguageInterface[]> {
        return this.Mihttp.get<{ data: LanguageInterface[] }>(`${this.urlLanguages}?pageSize=100`).pipe(
            map(response => response.data || [])
        );
    }

    getAllLevels(): Observable<LevelInterface[]> {
        return this.Mihttp.get<{ data: LevelInterface[] }>(`${this.urlLevels}?pageSize=100`).pipe(
            map(response => response.data || [])
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
    updateUser(user: UserInterface): Observable<UserInterface> {
        return this.Mihttp.put<UserInterface>(`${this.urlUsers}/me`, user);
    }

    uploadProfilePicture(file: File): Observable<string> {
        if (PROFILE_PICTURE_UPLOAD_MODE !== 'cloudinary') {
            return throwError(() => new Error('Modo de subida no soportado.'));
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
