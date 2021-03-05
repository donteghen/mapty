'use strict';


const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
let inputType = document.querySelector('.form__input--type');
let inputDistance = document.querySelector('.form__input--distance');
let inputDuration = document.querySelector('.form__input--duration');
let inputCadence = document.querySelector('.form__input--cadence');
let inputElevation = document.querySelector('.form__input--elevation');

class Workout {
    
    date  = new Date();
    id = (new Date().getTime() + '').slice(-10);
    constructor(coordinates, distance, duration, ){
        this.distance = distance;
        this.coordinates = coordinates;
        this.duration = duration
        
    }
    _setDescription(){
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
    }
}

class Running extends Workout{
    type = 'running';
    constructor(coordinates, distance, duration,  cadance){
        super(coordinates, distance, duration)
        this.cadance = cadance;
        this.calPace();
        this._setDescription()
    }
    calPace(){
        this.pace = this.duration / this.distance
    }
}



class Cycling extends Workout{
    type = 'cycling';
    constructor(coordinates, distance, duration, elevationGain){
        super(distance, duration, coordinates)
        this.elevationGain = elevationGain;
        //this.type = 'cycling';
        this.calSpeed();
        this._setDescription()
    }
    calSpeed(){
        this.speed = this.duration / this.distance
    }
}


class App{
    #map;
    #mapEvent;
    #workouks = [];
    constructor(){
         // add toggle on select activity type
        inputType.addEventListener('change', this._toggleElevationField.bind(this));
        
        // mapty coordinates creation form
        form.addEventListener('submit', this.__newWorkout.bind(this));

        this._getPosition();
    }
   
    _getPosition(){
        if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),   
         function () {
            window.alert("couldn't get your location");
         });
        }
        
    }
    
    _loadMap(position){
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const coords = [latitude, longitude];
             this.#map = L.map('map').setView(coords, 13);
            L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.#map);
    
            L.marker(coords).addTo(this.#map).bindPopup(L.popup({
                autoClose : false,
                maxWidth : 250,
                minWidth : 50,
                closeOnClick : false,
                className: 'running-popup'
             })
            .setContent(`<p>${coords}</p>`)).openPopup();
            //create a handler for click event
            this.#map.on('click', this._showForm.bind(this))
    }
    _showForm(ev){
        this.#mapEvent = ev
        form.classList.remove('hidden');
        inputDistance.focus();
        
    }
   
    _toggleElevationField (){
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }
    __newWorkout(e){
        e.preventDefault();
        
        // get data
        const workOutType = inputType.value;
        const distance = Number.parseInt(inputDistance.value);
        const duration = Number.parseInt(inputDuration.value);
        //validate data
        
       // check for workout type
       if(workOutType === 'running'){
        const cadence = Number.parseInt(inputCadence.value);
        if(!Number.isFinite(distance) || distance <= 0 || 
           !Number.isFinite(duration) || duration <= 0 || 
           !Number.isFinite(cadence)|| cadence <=0 ) {
               window.alert("All inputs must be positive number");
               return ;
           }

        const runner = new Running([this.#mapEvent.latlng.lat, this.#mapEvent.latlng.lng], distance, duration, cadence); 
        this.#workouks.push(runner);
        console.log(runner)
        this._renderHistory(runner);
        
       }
       if(workOutType === 'cycling'){
           const eleGain = Number.parseInt(inputElevation.value);
           if(!Number.isFinite(distance) || distance <= 0 || 
           !Number.isFinite(duration) || duration <= 0 || 
           !Number.isFinite(eleGain) ) {
               window.alert("All inputs must be positive number & elevation gain can be positive")
               return ;
           }

        const cyler= new Cycling([this.#mapEvent.latlng.lat, this.#mapEvent.latlng.lng], distance, duration, eleGain); 
        this.#workouks.push(cyler); 
       // console.log(this.#workouks)
        this._renderHistory(this.cyler)
       
       }

     // clear inputs 
     inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value = '';

    const {lat, lng } = this.#mapEvent.latlng;  
    L.marker([lat, lng]).addTo(this.#map).bindPopup(
        L.popup({
            autoClose : false,
            maxWidth : 300,
            maxHeight : 50,
            closeOnClick : false,
            className: `${inputType.value}-popup`
         })
        .setContent(`<p>${this.#mapEvent.latlng}</p>`))
        .openPopup();
    }

     _renderHistory (workout){
         
           let html =  `<li class="workout workout--running" data-id=${workout.id}>
           <h2 class="workout__title">${workout.description}</h2>
           <div class="workout__details">
             <span class="workout__icon">${workout.type == 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
             <span class="workout__value">${workout.distance}</span>
             <span class="workout__unit">km</span>
           </div>
           <div class="workout__details">
             <span class="workout__icon">⏱</span>
             <span class="workout__value">${workout.duration}</span>
             <span class="workout__unit">min</span>
           </div>
          `;
            if(workout.type === 'running'){
                html += `<div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.pace.toFixed(1)}</span>
                <span class="workout__unit">min/km</span>
              </div>
              <div class="workout__details">
                <span class="workout__icon">🦶🏼</span>
                <span class="workout__value">${workout.cadance}</span>
                <span class="workout__unit">spm</span>
              </div></li>`
            }
            if(workout.type === 'cycling'){
                html += `
                <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.speed.toFixed(1)}</span>
                <span class="workout__unit">min/km</span>
              </div>
              <div class="workout__details">
                <span class="workout__icon">🦶🏼</span>
                <span class="workout__value">${workout.elevationGain}</span>
                <span class="workout__unit">spm</span>
              </div> 
              </li>
              `
            }
            form.insertAdjacentElement('afterend', html)
            console.log(html)
        }
    
    
}

const jogging = new App();

