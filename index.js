'use strict';

const express = require('express');
const { WebhookClient, Card, Suggestion } = require('dialogflow-fulfillment');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

/**
 * Fulfillment logic for Dialogflow intents.
 * This function creates a WebhookClient, defines all intent handlers,
 * maps intents to their corresponding functions, and then processes the request.
 */
function handleWebhook(request, response) {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  // 1. GenreBasedRecommendation Intent Handler
  function genreRecommendationHandler(agent) {
    const genre = agent.parameters.genre;
    
    // If genre is not provided, ask for it
    if (!genre) {
      agent.add('What genre of books are you interested in? For example, science fiction, fantasy, mystery, etc.');
      return;
    }
    
    // Check if user has any reading level preference in context
    const userPrefs = agent.getContext('user_preferences');
    const readingLevel = userPrefs ? userPrefs.parameters.reading_level : null;
    
    // If reading level not provided, ask for it
    if (!readingLevel) {
      // Save the genre for later use
      agent.setContext({
        name: 'genre_selected',
        lifespan: 5,
        parameters: { genre: genre }
      });
      
      agent.add(`Great choice! Do you prefer books that are easy, moderate, or challenging to read?`);
      agent.add(new Suggestion('Easy'));
      agent.add(new Suggestion('Moderate'));
      agent.add(new Suggestion('Challenging'));
      return;
    }
    
    // If we have both genre and reading level, provide recommendations
    let responseText = `Based on your interest in ${genre} books with ${readingLevel} reading level, here are my recommendations:\n\n`;
    
    if (genre.toLowerCase().includes('science') || genre.toLowerCase().includes('sci-fi')) {
      responseText += `1. "Dune" by Frank Herbert - The classic epic of a desert planet\n`;
      responseText += `2. "The Martian" by Andy Weir - An astronaut stranded on Mars\n`;
      responseText += `3. "Project Hail Mary" by Andy Weir - A man with amnesia on a mission to save Earth\n`;
    } else if (genre.toLowerCase().includes('fantasy')) {
      responseText += `1. "The Name of the Wind" by Patrick Rothfuss - A legendary wizard's tale\n`;
      responseText += `2. "The Way of Kings" by Brandon Sanderson - Epic fantasy with unique magic\n`;
      responseText += `3. "A Game of Thrones" by George R.R. Martin - Political intrigue in a medieval world\n`;
    } else if (genre.toLowerCase().includes('mystery') || genre.toLowerCase().includes('thriller')) {
      responseText += `1. "Gone Girl" by Gillian Flynn - A twisted psychological thriller\n`;
      responseText += `2. "The Silent Patient" by Alex Michaelides - A psychological mystery\n`;
      responseText += `3. "The Girl with the Dragon Tattoo" by Stieg Larsson - A murder mystery\n`;
    } else if (genre.toLowerCase().includes('romance')) {
      responseText += `1. "Pride and Prejudice" by Jane Austen - A classic romance\n`;
      responseText += `2. "Outlander" by Diana Gabaldon - Historical romance\n`;
      responseText += `3. "The Notebook" by Nicholas Sparks - Contemporary romance\n`;
    } else {
      responseText += `1. "To Kill a Mockingbird" by Harper Lee - A powerful story of racial injustice\n`;
      responseText += `2. "The Great Gatsby" by F. Scott Fitzgerald - The American Dream in the 1920s\n`;
      responseText += `3. "1984" by George Orwell - A dystopian classic about totalitarianism\n`;
    }
    
    // Save user preferences for future use
    agent.setContext({
      name: 'user_preferences',
      lifespan: 50,
      parameters: {
        genre: genre,
        reading_level: readingLevel
      }
    });
    
    responseText += `\nWould you like more information about any of these books?`;
    agent.add(responseText);
  }

  // 2. SimilarBookRecommendation Intent Handler
  function similarBookRecommendationHandler(agent) {
    const bookTitle = agent.parameters.book_title;
    
    if (!bookTitle) {
      agent.add('What book did you enjoy that you want similar recommendations for?');
      return;
    }
    
    let responseText = `Since you enjoyed "${bookTitle}", you might also like:\n\n`;
    
    if (bookTitle.toLowerCase().includes('harry potter')) {
      responseText += `1. "Percy Jackson & The Olympians" by Rick Riordan - Modern demigods on quests\n`;
      responseText += `2. "The Chronicles of Narnia" by C.S. Lewis - Children discover a magical world\n`;
      responseText += `3. "A Wizard of Earthsea" by Ursula K. Le Guin - A young wizard's coming of age\n`;
    } else if (bookTitle.toLowerCase().includes('game of thrones') || bookTitle.toLowerCase().includes('song of ice')) {
      responseText += `1. "The Wheel of Time" by Robert Jordan - Epic fantasy series\n`;
      responseText += `2. "The First Law" by Joe Abercrombie - Gritty fantasy\n`;
      responseText += `3. "Mistborn" by Brandon Sanderson - Unique magic system\n`;
    } else if (bookTitle.toLowerCase().includes('1984') || bookTitle.toLowerCase().includes('orwell')) {
      responseText += `1. "Brave New World" by Aldous Huxley - A dystopian society controlled by pleasure\n`;
      responseText += `2. "Fahrenheit 451" by Ray Bradbury - A world where books are burned\n`;
      responseText += `3. "The Handmaid's Tale" by Margaret Atwood - A dystopia where women are subjugated\n`;
    } else if (bookTitle.toLowerCase().includes('pride and prejudice') || bookTitle.toLowerCase().includes('austen')) {
      responseText += `1. "Sense and Sensibility" by Jane Austen - Another Austen classic\n`;
      responseText += `2. "Jane Eyre" by Charlotte Brontë - Gothic romance\n`;
      responseText += `3. "Wuthering Heights" by Emily Brontë - Passionate and dark romance\n`;
    } else {
      responseText += `1. "The Great Gatsby" by F. Scott Fitzgerald - Ambition and love in the 1920s\n`;
      responseText += `2. "To Kill a Mockingbird" by Harper Lee - A coming-of-age story about injustice\n`;
      responseText += `3. "The Catcher in the Rye" by J.D. Salinger - A teenage boy's alienation\n`;
    }
    
    responseText += `\nThese books share similar themes, styles, or settings with "${bookTitle}".`;
    agent.add(responseText);
  }

  // 3. BookInformation Intent Handler
  function bookInformationHandler(agent) {
    const bookInfo = agent.parameters.book_info;
    
    if (!bookInfo) {
      agent.add('What book would you like information about?');
      return;
    }
    
    let responseText = `Here's information about "${bookInfo}":\n\n`;
    
    if (bookInfo.toLowerCase().includes('to kill a mockingbird')) {
      responseText += `Author: Harper Lee\n`;
      responseText += `Published: 1960\n`;
      responseText += `Genre: Southern Gothic, Coming-of-age\n`;
      responseText += `Pages: 281\n`;
      responseText += `Rating: 4.8/5\n\n`;
      responseText += `Brief description: A story about racial injustice and moral growth in the American South during the 1930s, told through the eyes of a young girl named Scout Finch.\n`;
    } else if (bookInfo.toLowerCase().includes('harry potter')) {
      responseText += `Author: J.K. Rowling\n`;
      responseText += `Published: 1997-2007 (series)\n`;
      responseText += `Genre: Fantasy, Young Adult\n`;
      responseText += `Pages: Varies by book (223-759)\n`;
      responseText += `Rating: 4.7/5\n\n`;
      responseText += `Brief description: A series about Harry Potter, a young wizard who attends Hogwarts School of Witchcraft and Wizardry and faces the dark wizard Lord Voldemort.\n`;
    } else if (bookInfo.toLowerCase().includes('1984')) {
      responseText += `Author: George Orwell\n`;
      responseText += `Published: 1949\n`;
      responseText += `Genre: Dystopian, Political Fiction\n`;
      responseText += `Pages: 328\n`;
      responseText += `Rating: 4.7/5\n\n`;
      responseText += `Brief description: A dystopian novel that portrays a totalitarian society under constant surveillance, following Winston Smith as he rebels against the Party.\n`;
    } else if (bookInfo.toLowerCase().includes('pride and prejudice')) {
      responseText += `Author: Jane Austen\n`;
      responseText += `Published: 1813\n`;
      responseText += `Genre: Classic, Romance\n`;
      responseText += `Pages: 432\n`;
      responseText += `Rating: 4.7/5\n\n`;
      responseText += `Brief description: A romantic novel about the proud Mr. Darcy and the prejudiced Elizabeth Bennet as they navigate social expectations in 19th century England.\n`;
    } else {
      responseText += `Author: [Author information not available]\n`;
      responseText += `Published: [Publication date not available]\n`;
      responseText += `Genre: [Genre information not available]\n`;
      responseText += `Pages: [Page count not available]\n`;
      responseText += `Rating: [Rating not available]\n\n`;
      responseText += `Brief description: [Description not available for this book]\n`;
      responseText += `\nI apologize, but I don't have detailed information about this specific book in my database.\n`;
    }
    
    responseText += `\nWould you like recommendations for similar books?`;
    agent.add(responseText);
  }

  // 4. TopRatedBooks Intent Handler
  function topRatedBooksHandler(agent) {
    const genre = agent.parameters.genre;
    let responseText = '';
    
    if (genre) {
      responseText = `Here are some of the highest-rated ${genre} books:\n\n`;
      
      if (genre.toLowerCase().includes('science') || genre.toLowerCase().includes('sci-fi')) {
        responseText += `1. "Dune" by Frank Herbert - 4.7/5 (9,800+ ratings)\n`;
        responseText += `2. "Ender's Game" by Orson Scott Card - 4.6/5 (7,500+ ratings)\n`;
        responseText += `3. "The Martian" by Andy Weir - 4.7/5 (6,900+ ratings)\n`;
      } else if (genre.toLowerCase().includes('fantasy')) {
        responseText += `1. "The Lord of the Rings" by J.R.R. Tolkien - 4.8/5 (8,700+ ratings)\n`;
        responseText += `2. "A Game of Thrones" by George R.R. Martin - 4.7/5 (7,300+ ratings)\n`;
        responseText += `3. "The Name of the Wind" by Patrick Rothfuss - 4.8/5 (6,200+ ratings)\n`;
      } else if (genre.toLowerCase().includes('mystery') || genre.toLowerCase().includes('thriller')) {
        responseText += `1. "Gone Girl" by Gillian Flynn - 4.5/5 (8,300+ ratings)\n`;
        responseText += `2. "The Silent Patient" by Alex Michaelides - 4.6/5 (5,600+ ratings)\n`;
        responseText += `3. "And Then There Were None" by Agatha Christie - 4.7/5 (6,100+ ratings)\n`;
      } else if (genre.toLowerCase().includes('romance')) {
        responseText += `1. "Pride and Prejudice" by Jane Austen - 4.7/5 (8,500+ ratings)\n`;
        responseText += `2. "Outlander" by Diana Gabaldon - 4.6/5 (7,100+ ratings)\n`;
        responseText += `3. "The Notebook" by Nicholas Sparks - 4.5/5 (5,900+ ratings)\n`;
      } else {
        responseText += `1. "To Kill a Mockingbird" by Harper Lee - 4.8/5 (10,000+ ratings)\n`;
        responseText += `2. "Pride and Prejudice" by Jane Austen - 4.7/5 (8,500+ ratings)\n`;
        responseText += `3. "The Great Gatsby" by F. Scott Fitzgerald - 4.7/5 (7,200+ ratings)\n`;
      }
    } else {
      responseText = `Here are some of the highest-rated books of all time:\n\n`;
      responseText += `1. "To Kill a Mockingbird" by Harper Lee - 4.8/5 (10,000+ ratings)\n`;
      responseText += `2. "Pride and Prejudice" by Jane Austen - 4.7/5 (8,500+ ratings)\n`;
      responseText += `3. "The Great Gatsby" by F. Scott Fitzgerald - 4.7/5 (7,200+ ratings)\n`;
    }
    
    responseText += `\nThese books have consistently received praise from readers worldwide. Would you like more information about any of them?`;
    agent.add(responseText);
  }

  // 5. MultiCriteriaRecommendation Intent Handler
  function multiCriteriaRecommendationHandler(agent) {
    const genre = agent.parameters.genre;
    const length = agent.parameters.length;
    
    if (!genre && !length) {
      agent.add('I can recommend books based on specific criteria. Would you like recommendations based on genre, book length, or both?');
      agent.add(new Suggestion('Genre'));
      agent.add(new Suggestion('Book length'));
      agent.add(new Suggestion('Both'));
      return;
    }
    
    if (genre && !length) {
      agent.setContext({
        name: 'genre_selected',
        lifespan: 5,
        parameters: { genre: genre }
      });
      
      agent.add(`Great! You're interested in ${genre} books. Do you prefer short books (under 300 pages), medium-length books (300-500 pages), or long books (over 500 pages)?`);
      agent.add(new Suggestion('Short books'));
      agent.add(new Suggestion('Medium-length books'));
      agent.add(new Suggestion('Long books'));
      return;
    }
    
    if (length && !genre) {
      agent.setContext({
        name: 'length_selected',
        lifespan: 5,
        parameters: { length: length }
      });
      
      agent.add(`I see you're looking for ${length} books. What genre are you interested in?`);
      agent.add(new Suggestion('Fantasy'));
      agent.add(new Suggestion('Science Fiction'));
      agent.add(new Suggestion('Mystery'));
      agent.add(new Suggestion('Romance'));
      return;
    }
    
    let responseText = `Based on your criteria (genre: ${genre}, length: ${length}), here are some recommendations:\n\n`;
    
    if (genre.toLowerCase().includes('fantasy')) {
      if (length.toLowerCase().includes('short')) {
        responseText += `1. "The Ocean at the End of the Lane" by Neil Gaiman - 181 pages\n`;
        responseText += `2. "A Wizard of Earthsea" by Ursula K. Le Guin - 183 pages\n`;
        responseText += `3. "Coraline" by Neil Gaiman - 162 pages\n`;
      } else if (length.toLowerCase().includes('medium')) {
        responseText += `1. "The Hobbit" by J.R.R. Tolkien - 366 pages\n`;
        responseText += `2. "Mistborn: The Final Empire" by Brandon Sanderson - 432 pages\n`;
        responseText += `3. "The Night Circus" by Erin Morgenstern - 391 pages\n`;
      } else {
        responseText += `1. "The Way of Kings" by Brandon Sanderson - 1007 pages\n`;
        responseText += `2. "A Game of Thrones" by George R.R. Martin - 835 pages\n`;
        responseText += `3. "The Name of the Wind" by Patrick Rothfuss - 662 pages\n`;
      }
    } else if (genre.toLowerCase().includes('science') || genre.toLowerCase().includes('sci-fi')) {
      if (length.toLowerCase().includes('short')) {
        responseText += `1. "All Systems Red" by Martha Wells - 144 pages\n`;
        responseText += `2. "The Time Machine" by H.G. Wells - 118 pages\n`;
        responseText += `3. "Fahrenheit 451" by Ray Bradbury - 249 pages\n`;
      } else if (length.toLowerCase().includes('medium')) {
        responseText += `1. "Ender's Game" by Orson Scott Card - 352 pages\n`;
        responseText += `2. "The Martian" by Andy Weir - 387 pages\n`;
        responseText += `3. "Ready Player One" by Ernest Cline - 374 pages\n`;
      } else {
        responseText += `1. "Dune" by Frank Herbert - 617 pages\n`;
        responseText += `2. "The Three-Body Problem" by Liu Cixin - 592 pages\n`;
        responseText += `3. "Hyperion" by Dan Simmons - 576 pages\n`;
      }
    } else if (genre.toLowerCase().includes('mystery') || genre.toLowerCase().includes('thriller')) {
      if (length.toLowerCase().includes('short')) {
        responseText += `1. "And Then There Were None" by Agatha Christie - 264 pages\n`;
        responseText += `2. "The Maltese Falcon" by Dashiell Hammett - 224 pages\n`;
        responseText += `3. "The Hound of the Baskervilles" by Arthur Conan Doyle - 256 pages\n`;
      } else if (length.toLowerCase().includes('medium')) {
        responseText += `1. "Gone Girl" by Gillian Flynn - 422 pages\n`;
        responseText += `2. "The Silent Patient" by Alex Michaelides - 336 pages\n`;
        responseText += `3. "The Girl with the Dragon Tattoo" by Stieg Larsson - 465 pages\n`;
      } else {
        responseText += `1. "The Stand" by Stephen King - 1152 pages\n`;
        responseText += `2. "It" by Stephen King - 1138 pages\n`;
        responseText += `3. "11/22/63" by Stephen King - 849 pages\n`;
      }
    } else {
      if (length.toLowerCase().includes('short')) {
        responseText += `1. "The Great Gatsby" by F. Scott Fitzgerald - 180 pages\n`;
        responseText += `2. "Of Mice and Men" by John Steinbeck - 112 pages\n`;
        responseText += `3. "The Stranger" by Albert Camus - 123 pages\n`;
      } else if (length.toLowerCase().includes('medium')) {
        responseText += `1. "To Kill a Mockingbird" by Harper Lee - 281 pages\n`;
        responseText += `2. "Pride and Prejudice" by Jane Austen - 432 pages\n`;
        responseText += `3. "1984" by George Orwell - 328 pages\n`;
      } else {
        responseText += `1. "War and Peace" by Leo Tolstoy - 1225 pages\n`;
        responseText += `2. "Les Misérables" by Victor Hugo - 1232 pages\n`;
        responseText += `3. "Atlas Shrugged" by Ayn Rand - 1168 pages\n`;
      }
    }
    
    responseText += `\nWould you like more information about any of these books?`;
    agent.add(responseText);
  }

  // 6. AuthorBasedRecommendation Intent Handler
  function authorBasedRecommendationHandler(agent) {
    const author = agent.parameters.author;
    
    if (!author) {
      agent.add('Which author are you interested in?');
      return;
    }
    
    let responseText = `Here are some notable works by ${author}:\n\n`;
    
    if (author.toLowerCase().includes('stephen king')) {
      responseText += `1. "The Shining" (1977) - A supernatural horror novel about a haunted hotel\n`;
      responseText += `2. "It" (1986) - A horror novel about a mysterious entity that preys on children\n`;
      responseText += `3. "The Stand" (1978) - A post-apocalyptic dark fantasy novel\n\n`;
      responseText += `"The Shining" is considered one of his most acclaimed works.\n`;
    } else if (author.toLowerCase().includes('jane austen')) {
      responseText += `1. "Pride and Prejudice" (1813) - A romantic novel focusing on the Bennet family\n`;
      responseText += `2. "Sense and Sensibility" (1811) - A novel about the Dashwood sisters\n`;
      responseText += `3. "Emma" (1815) - A novel about a well-intentioned but misguided matchmaker\n\n`;
      responseText += `"Pride and Prejudice" is considered her most beloved and influential work.\n`;
    } else if (author.toLowerCase().includes('tolkien')) {
      responseText += `1. "The Hobbit" (1937) - A fantasy adventure about Bilbo Baggins\n`;
      responseText += `2. "The Lord of the Rings" (1954-1955) - Epic fantasy trilogy\n`;
      responseText += `3. "The Silmarillion" (1977) - Mythopoeic history of Middle-earth\n\n`;
      responseText += `"The Lord of the Rings" is his most famous and influential work.\n`;
    } else if (author.toLowerCase().includes('rowling')) {
      responseText += `1. "Harry Potter series" (1997-2007) - Fantasy series about a young wizard\n`;
      responseText += `2. "The Casual Vacancy" (2012) - A novel about local politics in a small English town\n`;
      responseText += `3. "Cormoran Strike series" (as Robert Galbraith) - Detective fiction\n\n`;
      responseText += `The Harry Potter series has sold over 500 million copies worldwide.\n`;
    } else if (author.toLowerCase().includes('agatha christie')) {
      responseText += `1. "And Then There Were None" (1939) - Mystery novel about ten strangers on an island\n`;
      responseText += `2. "Murder on the Orient Express" (1934) - Hercule Poirot detective novel\n`;
      responseText += `3. "The Murder of Roger Ackroyd" (1926) - Considered one of her masterpieces\n\n`;
      responseText += `Agatha Christie is the best-selling novelist of all time.\n`;
    } else {
      responseText += `1. "Major Work 1" - Brief description\n`;
      responseText += `2. "Major Work 2" - Brief description\n`;
      responseText += `3. "Major Work 3" - Brief description\n\n`;
      responseText += `I have limited information about this author, but these are some of their notable works.\n`;
    }
    
    responseText += `Would you like recommendations for similar authors?`;
    agent.add(responseText);
  }

  // Helper handler for reading level input (follow-up to genre recommendation)
  function readingLevelHandler(agent) {
    const readingLevel = agent.parameters.reading_level;
    const genreContext = agent.getContext('genre_selected');
    
    if (!genreContext) {
      agent.add("I need to know what genre you're interested in before I can consider reading level. What type of books do you enjoy?");
      return;
    }
    
    const genre = genreContext.parameters.genre;
    
    // Save user preferences
    agent.setContext({
      name: 'user_preferences',
      lifespan: 50,
      parameters: {
        genre: genre,
        reading_level: readingLevel
      }
    });
    
    // Continue with the genre recommendation
    genreRecommendationHandler(agent);
  }

  // Helper handler for length input (follow-up to multi-criteria)
  function lengthInputHandler(agent) {
    const length = agent.parameters.length;
    const genreContext = agent.getContext('genre_selected');
    
    if (!genreContext) {
      agent.add("I need to know what genre you're interested in as well. What type of books do you enjoy?");
      return;
    }
    
    const genre = genreContext.parameters.genre;
    agent.parameters.genre = genre;
    agent.parameters.length = length;
    multiCriteriaRecommendationHandler(agent);
  }

  // Map intents to handler functions
  let intentMap = new Map();
  intentMap.set('GenreBasedRecommendationIntent', genreRecommendationHandler);
  intentMap.set('SimilarBookRecommendationIntent', similarBookRecommendationHandler);
  intentMap.set('BookInformationIntent', bookInformationHandler);
  intentMap.set('TopRatedBooksIntent', topRatedBooksHandler);
  intentMap.set('MultiCriteriaRecommendationIntent', multiCriteriaRecommendationHandler);
  intentMap.set('AuthorBasedRecommendationIntent', authorBasedRecommendationHandler);
  intentMap.set('ReadingLevelInputIntent', readingLevelHandler);
  intentMap.set('LengthInputIntent', lengthInputHandler);

  return agent.handleRequest(intentMap);
}

// Express routes
app.post('/webhook', (request, response) => {
  return handleWebhook(request, response);
});

app.get('/', (req, res) => {
  res.send('Book Recommendation Chatbot Fulfillment is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
