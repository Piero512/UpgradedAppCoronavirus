import {Storage} from '@ionic/storage';
import {Injectable} from '@angular/core';

/*
  Generated class for the StorageManagerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class StorageProvider {

    constructor(private storage: Storage) {
    }

    async get(key: string) {
        try {
            const user = await this.storage.get('user');
            let users = await this.storage.get('users');
            users = JSON.parse(users);
            return users[user][key];
        } catch (error) {
            throw error;
        }
    }

    getUser() {
        return this.storage.get('user');
    }

    getDatasetId() {
        return this.storage.get('datasetId');
    }

    getNotifications() {
        return this.storage.get('notifications');
    }

    getCurrentScore() {
        return this.storage.get('currentScore');
    }

    async set(key: string, value: any) {
        try {
            const user = await this.storage.get('user');
            let users = await this.storage.get('users');
            users = JSON.parse(users);
            users[user][key] = value;
            const result = await this.storage.set('users', JSON.stringify(users));
            return result;
        } catch (error) {
            throw error;
        }
    }

    setUser(user: string) {
        return this.storage.set('user', user);
    }

    async setUserData(userStr: string) {
        try {
            let users = await this.storage.get('users');
            users = JSON.parse(users);
            if (users != null) {
                users[userStr] = users[userStr] || {user: userStr};
                return await this.storage.set('users', JSON.stringify(users));
            }
            const newUsers = {};
            newUsers[userStr] = {user: userStr};
            return await this.storage.set('users', JSON.stringify(newUsers));
        } catch (error) {
            throw error;
        }
    }

    setDatasetId(datasetId: string) {
        return this.storage.set('datasetId', datasetId);
    }

    setNotifications(notifications: any[]) {
        return this.storage.set('notifications', notifications);
    }

    setCurrentScore(currentScore: number) {
        return this.storage.set('currentScore', currentScore);
    }

    forEach(exec: any) {
        this.storage.forEach(exec);
    }
}
