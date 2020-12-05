/* tslint:disable:variable-name */
export class WifiScore{
    get_wifi_score_signal_intensity(available_networks, max_signal_intensity= 5): number{
        const number_networks_available = available_networks.length;

        if (number_networks_available > 0){
            const maximum_signal_intensity = max_signal_intensity;
            let signal_intensity = 0;
            console.log('Number of networks available: ' + number_networks_available);

            for (const network of available_networks){
                signal_intensity += network.level;
            }

            const signal_intensity_average = signal_intensity / number_networks_available;
            const signal_intensity_score = (signal_intensity_average / maximum_signal_intensity).toFixed(2);
            console.log('Final(average) score: ' + signal_intensity_score);
            return Number(signal_intensity_score);
        }
        return 1;
    }

    get_wifi_score_networks_available(number_networks_available, X= 1.5, number_home_networks): number{
        if (number_networks_available > 0){
            console.log('Number of networks available: ' + number_networks_available);
            const max_networks_allowed = number_home_networks * X;
            if (number_networks_available >= max_networks_allowed) {
                return 1;
            }
            else{
                const networks_available_score = (number_networks_available / max_networks_allowed).toFixed(2);
                return Number(networks_available_score);
            }
        }
        return 1;
    }
}
