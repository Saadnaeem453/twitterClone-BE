import { Response } from "express"


export const errorHandler = (error :unknown , res:Response) => {
if(error instanceof Error){
    res.status(500).json({error: error.message})
}
else{
    res.status(500).json({error: "An unexpected error occurred"})

}
}