import axios from "axios"
import dotenv from "dotenv"

dotenv.config();





export const checkBlacklist = async (identity: string): Promise<boolean> => {4
  const KARMA_API_URL = process.env.KARMA_API_URL
  const BEARER_TOKEN = process.env.LENDSQR_BEARER_TOKEN
  try {
    const url = `${KARMA_API_URL}/${identity}`
    
    const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
        },
      });
    const amount = response.data?.amount_in_contention
  
    if (amount > 0.00 ) {
        return true
    } else {
      return false
    }
    
    
  } catch (error) {
    console.error("Error in accessing API", error)
    throw new Error("Error found in API Access")
  }

}
