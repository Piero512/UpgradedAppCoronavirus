import {Component, NgZone, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {StorageProvider} from '../../providers/storage/storage';
import {ScoreProvider} from '../../providers/score/score';
import {AlertProvider} from '../../providers/alert/alert';

import {HomeInformationComponent} from '../../components/home-information/home-information';

declare var BackgroundGeolocation: any;

@Component({
    selector: 'app-page-user',
    templateUrl: 'user.page.html',
})

export class UserPage implements OnInit {

    currentScore: number;
    currentScoreColor: string;
    ableToTrack: boolean;
    scores: any;
    colors = {'1': '#49BEAA', '2': '#EEB868', '3': '#EF767A', '-1': '#999999'};

    constructor(
        private app: App,
        private storage: StorageProvider,
        private scoreProvider: ScoreProvider,
        private ngZone: NgZone,
        private alert: AlertProvider,
        private modalController: ModalController,
        private events: Events,
    ) {
    }

    ngOnInit() {
        const scores = [];
        for (let i = 0; i < 24; i++) {
            const missingScore = this.getMissingScore(i);
            scores.push(missingScore);
        }
        this.scores = scores; // Default score bar while waiting for stored scores
        this.events.subscribe('scoreChanges', () => this.refreshScores());
    }

    ionViewWillEnter() {
        this.refreshScores();
    }

    async refreshScores(refresher?: any) {
        const homeArea = await this.storage.get('homeArea');
        if (homeArea) {
            this.ableToTrack = true;
            this.updateCurrentScore(1); // Default current score while waiting for stored scores
            this.fillScores();
        }
        if (refresher){
            refresher.complete();
        }
    }

    fillScores() {
        BackgroundGeolocation.getScores(scores => {
            if (scores.length > 0) {
                // Update current score based on the last score retrieved
                const lastScore = scores[scores.length - 1];
                this.updateCurrentScore(lastScore.value);

                // Fill missing scores at the beginning
                const scoresToShow = [];
                const firstScore = scores[0];
                for (let i = 0; i < firstScore.hour; i++) {
                    const missingScore = this.getMissingScore(i);
                    scoresToShow.push(missingScore);
                }

                // Add real scores
                for (let i = 1; i < scores.length; i++) {
                    const prevScore = {...scores[i - 1]};
                    const score = {...scores[i]};
                    // Check for missing scores when no locations had been recorded and add them
                    const diffHours = (score.hour) - (prevScore.hour);
                    if (diffHours > 1) {
                        for (let x = 1; x < diffHours; x++) {
                            const missingScore = prevScore;
                            missingScore.color = this.getColorByScore(missingScore.value);
                            missingScore.hour += x;
                            scoresToShow.push(missingScore);
                        }
                    }
                    prevScore.color = this.getColorByScore(prevScore.value);
                    scoresToShow.push(prevScore);
                }
                lastScore.color = this.getColorByScore(lastScore.value);
                scoresToShow.push(lastScore);

                // Fill missing scores at the end
                for (let i = scoresToShow.length; i < 24; i++) {
                    const missingScore = this.getMissingScore(i);
                    scoresToShow.push(missingScore);
                }
                this.updateScores(scoresToShow);
            }
        });
    }

    getMissingScore(hour: number) {
        const missingScore = {'hour': hour, 'score': -1};
        missingScore['color'] = this.getColorByScore(missingScore.score);
        return missingScore;
    }

    updateCurrentScore(score: number) {
        this.ngZone.run(() => {
            this.currentScore = score || -1;
            this.currentScoreColor = this.getColorByScore(this.currentScore);
        });
    }

    updateScores(scores: any[]) {
        this.ngZone.run(() => {
            this.scores = scores;
        });
    }

    getColorByScore(score: number) {
        return this.colors[Math.ceil(score)];
    }

    logout() {
        this.storage.setUser(null).then(() => {
            this.scoreProvider.backgroundGeolocation.stop();
            // TODO: return to AuthPage, and remove data
            //  this.app.getRootNav().setRoot(AuthPage);
        });
    }

    async showHomeInfoModal() {
        const modal = await this.modalController.create({
            component: HomeInformationComponent, componentProps: undefined
        });
        await modal.present();
        await modal.onWillDismiss().then(() => this.refreshScores());
    }

    scoreInformation() {
        this.alert.scoreInformation();
    }
}
