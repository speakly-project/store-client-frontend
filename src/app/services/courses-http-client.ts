import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, switchMap, throwError } from 'rxjs';
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

    createUser(user: Omit<UserInterface, 'id'>): Observable<UserInterface> {
        return this.Mihttp.post<UserInterface>(this.urlUsers, user);
    }
    updateUser(user: UserInterface): Observable<UserInterface> {
        return this.Mihttp.put<UserInterface>(`${this.urlUsers}/me`, user);
    }

    getUploadSignature() {
        return this.Mihttp.get<any>('http://localhost:8080/speakly/upload/signature');
    }

    uploadProfilePicture(file: File): Observable<string> {

        return this.getUploadSignature().pipe(
            switchMap(sig => {

                const formData = new FormData();
                formData.append('file', file);
                formData.append('api_key', sig.apiKey);
                formData.append('timestamp', sig.timestamp);
                formData.append('signature', sig.signature);
                formData.append('folder', 'profiles');

                const url = `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`;

                return this.Mihttp.post<any>(url, formData).pipe(
                    map(res => res.secure_url)
                );
            })
        );
    }


    updateUserPassword(currentPassword: string, newPassword: string): Observable<void> {
        const payload = {
            currentPassword,
            oldPassword: currentPassword,
            newPassword
        };
        return this.Mihttp.put<void>(`${this.urlUsers}/passwd`, payload);
    }

}
