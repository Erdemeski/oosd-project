import Client from '../models/client.model.js';


export const createClient = async (req, res, next) => {
    try{
        const newClient = await Client.create(req.body);

        res.status(201).json({
            success: true,
            data: newClient
        });// eğer kayıt başarılı ise 201 döndürecek
    }catch(error){
        //kayıt sırasında hata olursa
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}

export const getClients = async (req, res, next) => {
    try{
        const clients = await Client.find();

        res.status(200).json({
            success: true,
            data: clients
        });

    }catch(error){
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}