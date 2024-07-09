class apiError extends Error {
    constructor (
        statusCode,
        massage= "Something went wrong",
        errors = [],
        stack = ""

    ) {
        super(massage)
        this.statusCode = statusCode
        this.data = null
        this.massage = massage
        this.success = false;
        this.errors = errors



        if(stack){
            this.stack = stack
        }else{
            Error.capturestackTrace(this, 
                this.constructor)
        }
    }
}

export { apiError }