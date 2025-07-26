function showLogin() {
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("signupForm").style.display = "none";
  document.getElementById("message").innerText = "";
  document.getElementById("message").style.color = "red";
}

function showSignup() {
  document.getElementById("signupForm").style.display = "block";
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("message").innerText = "";
  document.getElementById("message").style.color = "red";
}

function signup(event) {
  event.preventDefault();
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;

  // Check if user already exists using enhanced storage
  if (typeof UserStorage !== 'undefined') {
    if (UserStorage.getUserByEmail(email)) {
      document.getElementById("message").innerText = "User already exists!";
      return false;
    }
    
    // Create new user
    const newUser = { 
      id: Date.now(),
      name, 
      email, 
      password,
      createdAt: new Date().toISOString()
    };
    
    // Save user and set as current user
    UserStorage.saveUser(newUser);
    UserStorage.setCurrentUser(newUser);
  } else {
    // Fallback to old method
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(u => u.email === email)) {
      document.getElementById("message").innerText = "User already exists!";
      return false;
    }
    
    const newUser = { 
      id: Date.now(),
      name, 
      email, 
      password,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify(newUser));
  }

  document.getElementById("message").style.color = "green";
  document.getElementById("message").innerText = "Signup successful! Redirecting...";

  // Redirect to index.html after 1 second
  setTimeout(() => {
    window.location.href = "index.html";
  }, 1000);
  
  return false;
}

function login(event) {
  event.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  let user = null;
  
  // Use enhanced storage if available
  if (typeof UserStorage !== 'undefined') {
    user = UserStorage.getUserByEmail(email);
  } else {
    // Fallback to old method
    const users = JSON.parse(localStorage.getItem('users')) || [];
    user = users.find(u => u.email === email);
  }
  
  if (!user) {
    document.getElementById("message").style.color = "red";
    document.getElementById("message").innerText = "User not found.";
    return false;
  }

  if (user.password === password) {
    document.getElementById("message").style.color = "green";
    document.getElementById("message").innerText = `Welcome back, ${user.name}! Redirecting...`;

    // Set login status using enhanced storage
    if (typeof UserStorage !== 'undefined') {
      UserStorage.setCurrentUser(user);
    } else {
      // Fallback to old method
      localStorage.setItem('userLoggedIn', 'true');
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    localStorage.setItem("loggedInUser", user.name); // Keep for compatibility

    // Redirect to index.html after 1 second
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
  } else {
    document.getElementById("message").style.color = "red";
    document.getElementById("message").innerText = "Incorrect password.";
  }

  return false;
}
