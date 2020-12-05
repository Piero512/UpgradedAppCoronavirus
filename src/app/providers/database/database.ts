import {Injectable} from '@angular/core';
import {Platform} from '@ionic/angular';
import {SQLite, SQLiteObject} from '@ionic-native/sqlite/ngx';
import {BehaviorSubject} from 'rxjs';
import {StorageProvider} from '../storage/storage';

/*
  Generated class for the DatabaseProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class DatabaseProvider {

    private database: SQLiteObject;
    private dbReady = new BehaviorSubject<boolean>(false);

    constructor(private platform: Platform, private sqlite: SQLite, private storage: StorageProvider) {
        this.platform.ready().then(() => {
            this.sqlite.create({
                name: 'qvid.db',
                location: 'default'
            }).then((db: SQLiteObject) => {
                this.database = db;
                this.createTables().then(() => {
                    this.dbReady.next(true);
                });
            });
        });
    }

    private async createTables() {
        return this.database.executeSql(
            `CREATE TABLE IF NOT EXISTS score (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            app_id TEXT,
            score FLOAT,
            date TEXT,
            hour NUMBER,
            max_distance_home FLOAT,
            max_time_away FLOAT,
            encoded_route TEXT,
            status TEXT DEFAULT 'PENDING'
        );`, []).then(() => {
            return this.database.executeSql(
                `CREATE TABLE IF NOT EXISTS location (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            app_id TEXT,
            latitude FLOAT,
            longitude FLOAT,
            date TEXT,
            hour INTEGER,
            distance_score FLOAT,
            time_score FLOAT,
            wifi_score FLOAT,
            distance_home FLOAT,
            time_away FLOAT,
            population_density FLOAT
            );`, []);
        }).catch(console.log);
    }

    private isReady() {
        return new Promise((resolve, reject) => {
            if (this.dbReady.getValue()) { // if dbReady is true, resolve
                resolve();
            } else { // otherwise, wait to resolve until dbReady returns true
                this.dbReady.subscribe((ready) => {
                    if (ready) {
                        resolve();
                    }
                });
            }
        });
    }

    async getScores() {
        const appId = await this.storage.getUser();
        return this.isReady().then(async () => {
            return this.database.executeSql(`SELECT * from score WHERE app_id = '${appId}';`, []).then(data => {
                const lists = [];
                for (let i = 0; i < data.rows.length; i++) {
                    lists.push(data.rows.item(i));
                }
                return lists;
            });
        });
    }

    async getPendingScores() {
        const appId = await this.storage.getUser();
        return this.isReady().then(async () => {
            return this.database.executeSql(`SELECT * from score WHERE app_id = '${appId}' AND status = 'PENDING';`, []).then(data => {
                const lists = [];
                for (let i = 0; i < data.rows.length; i++) {
                    lists.push(data.rows.item(i));
                }
                return lists;
            });
        });
    }

    async getTodayScores() {
        const appId = await this.storage.getUser();
        const date = new Date().toLocaleDateString();
        return this.isReady().then(async () => {
            return this.database.executeSql(
                `SELECT * from score WHERE app_id = '${appId}' AND date = '${date}' ORDER BY hour ASC;`, []).then(data => {
                const lists = [];
                for (let i = 0; i < data.rows.length; i++) {
                    lists.push(data.rows.item(i));
                }
                return lists;
            });
        });
    }

    async getLastScore() {
        const appId = await this.storage.getUser();
        return this.isReady().then(async () => {
            return this.database.executeSql(
                `SELECT * FROM score WHERE app_id = '${appId}' ORDER BY id DESC LIMIT 1;`, []).then(data => {
                if (data.rows.length) {
                    return data.rows.item(0);
                }
                return null;
            });
        });
    }

    async getScoresByDate(date: string) {
        const appId = await this.storage.getUser();
        return this.isReady().then(async () => {
            return this.database.executeSql(
                `SELECT * from score WHERE app_id = '${appId}' AND date = '${date}' ORDER BY hour ASC;`, []).then(data => {
                const lists = [];
                for (let i = 0; i < data.rows.length; i++) {
                    lists.push(data.rows.item(i));
                }
                return lists;
            });
        });
    }

    async saveScore(
        score: number,
        date: Date,
        hour: number,
        maxDistanceHome: number,
        maxTimeAway: number,
        encodedRoute: string
    ) {
        const appId = await this.storage.getUser();
        const dateString = date.toLocaleDateString();
        return this.isReady().then(async () => {
            return this.database.executeSql(
                `INSERT INTO score(app_id,score,date,hour,max_distance_home,max_time_away,encoded_route)
            VALUES ('${appId}','${score}','${dateString}','${hour}','${maxDistanceHome}','${maxTimeAway}','${encodedRoute}');`, [])
                .then(result => {
                if (result.insertId) {
                    return this.getScore(result.insertId);
                }
            });
        });
    }

    async getScore(id: number) {
        const appId = await this.storage.getUser();
        return this.isReady().then(async () => {
            return this.database.executeSql(`SELECT * FROM score WHERE id = ${id} AND app_id = '${appId}';`, []).then(data => {
                if (data.rows.length) {
                    return data.rows.item(0);
                }
                return null;
            });
        });
    }

    async updateScoreStatus(id: number, status: string) {
        const appId = await this.storage.getUser();
        return this.isReady().then(() => {
            return this.database.executeSql(`UPDATE score SET status = "${status}" WHERE id = ${id} AND app_id = '${appId}';`, []);
        });
    }

    async deleteScores() {
        const appId = await this.storage.getUser();
        return this.isReady().then(() => {
            return this.database.executeSql(`DELETE FROM score WHERE app_id = '${appId}';`, []);
        });
    }

    async getLocations() {
        const appId = await this.storage.getUser();
        return this.isReady().then(async () => {
            return this.database.executeSql(`SELECT * from location WHERE app_id = '${appId}';`, []).then(data => {
                const lists = [];
                for (let i = 0; i < data.rows.length; i++) {
                    lists.push(data.rows.item(i));
                }
                return lists;
            });
        });
    }

    async addLocation(
        latitude: number,
        longitude: number,
        date: Date,
        distanceScore: number,
        distanceHome: number,
        timeAway: number,
        timeScore: number,
        wifiScore: number,
        populationDensity: number
    ) {
        const hour = date.getHours();
        const dateString = date.toLocaleDateString();
        const appId = await this.storage.getUser();
        return this.isReady().then(async () => {
            return this.database.executeSql(`INSERT INTO location(app_id,latitude,longitude,date,hour,distance_score,wifi_score,distance_home,time_away,time_score,population_density)
            VALUES ('${appId}','${latitude}','${longitude}','${dateString}','${hour}','${distanceScore}','${wifiScore}','${distanceHome}','${timeScore}','${timeAway}','${populationDensity}');`, []).then(result => {
                if (result.insertId) {
                    return this.getScore(result.insertId);
                }
            });
        });
    }

    async getLocation(id: number) {
        const appId = await this.storage.getUser();
        return this.isReady().then(async () => {
            return this.database.executeSql(`SELECT * FROM location WHERE id = ${id} AND app_id ='${appId}';`, []).then(data => {
                if (data.rows.length) {
                    return data.rows.item(0);
                }
                return null;
            });
        });
    }

    async deleteLocations() {
        const appId = await this.storage.getUser();
        return this.isReady().then(() => {
            return this.database.executeSql(`DELETE FROM location WHERE app_id = '${appId}';`, []);
        });
    }

    async deleteLocationsByHourAndDate(hour: number, date: Date) {
        const appId = await this.storage.getUser();
        const dateString = date.toLocaleDateString();
        return this.isReady().then(() => {
            return this.database.executeSql(
                `DELETE FROM location WHERE hour = ${hour} AND date = '${dateString}' AND app_id = '${appId}';`, []);
        });
    }

    async getHome() {
        const appId = await this.storage.getUser();
        return this.isReady().then(async () => {
            return this.database.executeSql(
                `SELECT home_latude, home_longitude, home_radius FROM location WHERE app_id = '${appId}';`, []).then(data => {
                if (data.rows.length) {
                    return data.rows.item(0);
                }
                return null;
            });
        });
    }

    async getLocationsByHourAndDate(hour: number, date: Date) {
        const appId = await this.storage.getUser();
        const dateString = date.toLocaleDateString();
        return this.isReady().then(async () => {
            return this.database.executeSql(
                `SELECT * FROM location WHERE hour = '${hour}' AND date = '${dateString}' AND app_id = '${appId}' ORDER BY id ASC;`, [])
                .then(data => {
                const locations = [];
                for (let i = 0; i < data.rows.length; i++) {
                    locations.push(data.rows.item(i));
                }
                return locations;
            });
        });
    }

}
