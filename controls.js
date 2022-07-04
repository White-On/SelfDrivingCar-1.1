class Controls{
    constructor(type){
        this.left = false;
        this.right = false;
        this.forward = false;
        this.backward = false;

        switch(type){
            case "keyboard":
                this.#addKeyboardListeners();
                break;
            case "dummy":
                this.forward = true;
                break;
        }
        
    }

    // le # permet de dire que la fonction est privée
    #addKeyboardListeners(){
        // on peux le voir comme une function mais permet a this de 
        // toujour référencer l'objet qui appelle la function
        document.onkeydown = (event) => {
            switch(event.key){
                case "ArrowLeft":
                    this.left = true;
                    break;
                case "ArrowRight":
                    this.right = true;
                    break;
                case "ArrowUp":
                    this.forward = true;
                    break;
                case "ArrowDown":
                    this.backward = true;
                    break;
            }
            // debugger;
            // console.table(this);
        }
        document.onkeyup = (event) => {
            switch(event.key){
                case "ArrowLeft":
                    this.left = false;
                    break;
                case "ArrowRight":
                    this.right = false;
                    break;
                case "ArrowUp":
                    this.forward = false;
                    break;
                case "ArrowDown":
                    this.backward = false;
                    break;
            }
            // debugger;
            // console.table(this);
        }
    }
}