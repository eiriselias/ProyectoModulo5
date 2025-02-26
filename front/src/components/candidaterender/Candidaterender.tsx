// import ICandidate from "@/interfaces/ICandidate";

// const Cartrender:React.FC<ICandidate> = ({...candidate}) => {
  
// return (
//     <div className="flex flex-row  justify-between mx-4 my-4 rounded-2xl bg-white shadow dark:bg-gray-800 dark:border-gray-700 "  >

//         <div className="relative flex flex-col text-gray-700 bg-white shadow-md bg-clip-border rounded-xl w-96">
//   <div className="relative mx-4 mt-4 overflow-hidden text-gray-700 bg-white bg-clip-border rounded-xl h-60">
//     <img className="h-60 w-72 m-auto"
//    src={candidate.imgUrl} alt={`imagen del candidato ${candidate.user.name}`} />
//   </div>
//   <div className="px-6 pt-2">
//     <div className="flex justify-center">
//       <p className="font-bold text-2xl capitalize">{candidate.user.name}</p>
//     </div>
//       <div className="flex flex-col">
//         <p className="font-bold">Postulacion:</p>
//         <p>{candidate.postulation}</p>
//         <p className="self-center my-4">{candidate.list}</p>
//       </div>
//   </div>
// </div>

//     </div>
// )
// }

// export default Cartrender

import ICandidate from "@/interfaces/ICandidate";
import { useRouter } from 'next/navigation'
import Link from "next/link";
import { useEffect, useState } from "react";
import Spinner from "../ui/Spinner";
const APIURL: string | undefined = process.env.NEXT_PUBLIC_API_URL;



// const Cartrender: React.FC<ICandidate & { onDelete: () => void; onAccess: () => void;}> = (props) => {
  
//   const {onDelete,onAccess, ...candidate} = props
   const Cartrender:React.FC<ICandidate> = ({...candidate}) => { 

    
const router = useRouter()
const [loading, setLoading] = useState(true);
useEffect(() => {
  // Simulando carga de datos
  const timer = setTimeout(() => {
    setLoading(false);
  }, 1000); // Simula un tiempo de carga de 1 segundo

  return () => clearTimeout(timer); // Limpieza
}, []);

if (loading) {
  return (
    <div className="flex justify-center items-center h-60">
      <Spinner /> {/* Mostrar el spinner mientras carga */}
    </div>
  );
}


  return (


    <div className="flex flex-row  justify-between mx-4 my-4 rounded-2xl bg-white shadow dark:bg-gray-800 dark:border-gray-700">
      {/* Contenido de la tarjeta */}
      <div className="relative flex flex-col text-gray-700 bg-white shadow-md bg-clip-border rounded-xl w-96">
        {/* Imagen y detalles del candidato */}
        <div className="relative mx-4 mt-4 overflow-hidden text-gray-700 bg-white bg-clip-border rounded-xl h-60">
          <img
            className="h-60 w-72 m-auto"
            src={candidate.imgUrl}
            alt={`imagen del candidato ${candidate.user.name}`}
          />
        </div>
        <div className="px-6 pt-2">
          <div className="flex justify-center">
            <p className="font-bold text-2xl capitalize">{candidate.user.name}</p>
          </div>
          <div className="flex flex-col">
            <p className="font-bold">Postulacion:</p>
            <p>{candidate.postulation}</p>
            <p className="self-center my-4">{candidate.list}</p>
          </div>
        </div>
             {/* Botones para eliminar y acceder al componente */}
      <div className="flex flex-col justify-center">
        <button  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mb-2">
          Eliminar
        </button>

        <button onClick={(event) => {
        window.location.href = `/updateCandidate?id=${candidate.user.id}`
        }} 
         key={candidate.user.id} 
        className="bg-primaryColor hover:bg-primaryColor text-white font-bold py-2 px-4 rounded mb-2"
        >
        actualizar
        </button>

        <button onClick={(event) => {

        window.location.href= `/candidates/${candidate.id}`;
        }} 
        key={candidate.user.id} 
        className="bg-primaryColor hover:bg-primaryColor text-white font-bold py-2 px-4 rounded"
        >
        votar
        </button>
      
      </div>
      </div>
 
    </div>
  );
};

export default Cartrender;