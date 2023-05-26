export const POST = async ({ request }) => {
    // ici tu recupere ta requete tu la met dans body 
    const body = await request.json()
    console.log(body);

    //ici tu retourne la reponse a l'émetteur de la requete
    return new Response(
        JSON.stringify({ message: 'Ta requette à bien été reçue michel ' }),
        { status: 200 }
    )
}