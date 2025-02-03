import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import "./index.css"; 
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
const stripePromise = loadStripe("pk_test_51QmzMLP4zUkcOZhYxV84K2Ooi4ZaZjfuBSNkGQWdrYMKsnT07u0xi3MRsE2cA40Iv2cskX4aToygdxifppahm4P000h87id0Ju");



createRoot(document.getElementById('root')).render(
    

<Elements stripe={stripePromise}>
<BrowserRouter>
     <App />
    </BrowserRouter>
</Elements>
   
 
)
