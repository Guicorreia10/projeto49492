export async function recognizeFoodWithClarifai(imageUri: string): Promise<string> {
    // 1. Converta a imagem para base64
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onerror = reject;
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(blob);
    });
    const base64 = await base64Promise;
  
    // 2. Suas credenciais do Clarifai (sem espaço extra!)
    const PAT = '622f783cf8b7489f887095dedb03d897';
    const USER_ID = '9vwg666vbfu1';
    const APP_ID = 'GlicoSleep';
    const WORKFLOW_ID = 'food-recognize';
  
    // 3. Corpo da requisição
    const raw = JSON.stringify({
      "user_app_id": {
        "user_id": USER_ID,
        "app_id": APP_ID
      },
      "inputs": [
        {
          "data": {
            "image": {
              "base64": base64
            }
          }
        }
      ]
    });
  
    // 4. Chamada à API Clarifai usando workflow
    const clarifaiResponse = await fetch(
      `https://api.clarifai.com/v2/workflows/${WORKFLOW_ID}/results`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Key ' + PAT,
          'Content-Type': 'application/json'
        },
        body: raw
      }
    );
  
    const data = await clarifaiResponse.json();
    // Veja a resposta para debugar
    console.log(JSON.stringify(data, null, 2));
  
    // 5. Pegue o alimento mais provável (usando workflow, o caminho muda!)
    const concepts = data.results?.[0]?.outputs?.[0]?.data?.concepts;
    if (concepts && concepts.length > 0) {
      return concepts[0].name; // Exemplo: "banana"
    }
    throw new Error('Alimento não reconhecido');
  }
  