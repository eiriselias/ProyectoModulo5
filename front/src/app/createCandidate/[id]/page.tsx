

import CreateCandidate from "@/components/createCandidate/createCandidate";


import React, { useEffect, useState } from 'react'


const CreateCandidateById: React.FC <{params:{id:string}}> = ({params}) => {


  return (
    <div className='bg-cuartiaryColor flex justify-center items-center h-[85vh] '>
      <CreateCandidate id={params.id} />
    </div>
  );
};

export default CreateCandidateById;


