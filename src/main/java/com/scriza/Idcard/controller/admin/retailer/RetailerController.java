package com.scriza.Idcard.controller.admin.retailer;
import com.scriza.Idcard.Entity.IdCard;
import com.scriza.Idcard.Entity.User;
import com.scriza.Idcard.Entity.admin.Token.Token;
import com.scriza.Idcard.Entity.admin.retailer.Activity;
import com.scriza.Idcard.Repository.UserRepository;
import com.scriza.Idcard.Repository.admin.Token.TokenRepository;
import com.scriza.Idcard.Repository.admin.distributor.ActivityRepositoryAdmin;
import com.scriza.Idcard.Repository.admin.distributor.ActivityRepositoryDis;
import com.scriza.Idcard.Repository.admin.retailer.ActivityRepository;
import com.scriza.Idcard.Repository.admin.retailer.IdCardRepository;
import com.scriza.Idcard.UserWithToken;
import com.scriza.Idcard.service.admin.retailer.RetailerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.*;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/retailer")
public class RetailerController {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TokenRepository tokenRepository;
    @Autowired
    private IdCardRepository idCardRepository;
    @Autowired
    private ActivityRepositoryDis activityRepositoryDis;
    @Autowired
    private ActivityRepositoryAdmin activityRepositoryAdmin;
    @Autowired
    private RetailerService retailerService;
    @Autowired
    private ActivityRepository activityRepository;
    @PostMapping("/create")
    public Map<String, String> createRetailer(@RequestParam String name,
                                              @RequestParam String email,
                                              @RequestParam String password,
                                              @RequestParam String company,
                                              @RequestParam String phoneNumber,
                                              @RequestParam String companyAddress,
                                              @RequestParam String designation,
                                              @RequestParam String creatorEmail) { // Add creatorEmail parameter
        try {
            User retailer = retailerService.createRetailer(name, email, password, company, phoneNumber, companyAddress, designation, creatorEmail);
            Map<String, String> response = new HashMap<>();
            response.put("email", retailer.getEmail());
            response.put("password", retailer.getPassword());
            response.put("message", "Retailer created successfully");
            return response;
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return response;
        }
    }
    @GetMapping("/listAllRetailer")
    public ResponseEntity<?> listRetailers(@RequestParam String adminEmail) {
        // Retrieve the user by email
        User adminUser = retailerService.getUserByEmail(adminEmail);

        // Check if the user has the "ADMIN" role
        if (adminUser != null && "ADMIN".equalsIgnoreCase(adminUser.getRole())) {
            List<UserWithToken> retailers = retailerService.getAllRetailersWithTokens();
            return ResponseEntity.ok(retailers);
        } else {
            return ResponseEntity.status(401).body("Unauthorized access");
        }
    }
    @PostMapping("/delete")
    public Map<String, String> deleteRetailer(@RequestParam String email, @RequestParam String creatorEmail , @RequestParam String requestingUserRole) {
        try {
            retailerService.deleteRetailer(email, creatorEmail,requestingUserRole);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Retailer deleted successfully");
            return response;
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return response;
        }
    }
    @GetMapping("/user-role")
    public Map<String, String> getUserRole(@RequestParam String email) {
        Map<String, String> response = new HashMap<>();
        try {
            String role = retailerService.getUserRole(email);
            response.put("role", role);
            return response;
        } catch (RuntimeException e) {
            response.put("error", e.getMessage());
            return response;
        }
    }
    @GetMapping("/list-by-creator")
    public Map<String, Object> listRetailersByCreator(@RequestParam String creatorEmail) {
        try {
            List<User> retailers = retailerService.listRetailersByCreator(creatorEmail);
            Map<String, Object> response = new HashMap<>();
            response.put("retailers", retailers);
            return response;
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            return response;
        }
    }

    @GetMapping("/list")
    public Iterable<User> listRetailer() {
        return retailerService.listRetailer();
    }
    @PostMapping("/createIdCard")
    public ResponseEntity<String> createIdCard(@RequestParam String retailerEmail,
                                               @RequestParam String name,
                                               @RequestParam String businessName,
                                               @RequestParam String businessAddress,
                                               @RequestParam String phoneNumber,
                                               @RequestParam("photo") MultipartFile photo,
                                               @RequestParam String emailAddress,
                                               @RequestParam String permanentAddress,
                                               @RequestParam String currentAddress) throws IOException {
        User retailer = userRepository.findByEmail(retailerEmail);
        if (retailer == null) {
            throw new RuntimeException("Retailer not found");
        }
        if (!"RETAILER".equalsIgnoreCase(retailer.getRole())) {
            throw new RuntimeException("Only retailers can create ID cards");
        }

        Token token = tokenRepository.findByUserEmail(retailerEmail);
        if (token == null || token.getTokenAmount() <= 0) {
            throw new RuntimeException("Insufficient tokens");
        }

        // Deduct one token
        token.setTokenAmount(token.getTokenAmount() - 1);
        tokenRepository.save(token);

        // Create the ID card HTML content


        // Convert HTML to PDF


        IdCard idCard = new IdCard();
        idCard.setName(name);
        idCard.setBusinessName(businessName);
        idCard.setBusinessAddress(businessAddress);
        idCard.setPhoneNumber(phoneNumber);
        idCard.setEmailAddress(emailAddress);
        idCard.setPermanentAddress(permanentAddress);
        idCard.setCurrentAddress(currentAddress);
        idCard.setPhoto(photo.getBytes());
        idCard.setCreatorEmail(retailerEmail);

        IdCard savedIdCard = idCardRepository.save(idCard);

        // Log activity
        logActivity(
                "ID_CARD_CREATION",
                "ID card created for " + name,
                retailerEmail
        );
        // Convert photo to base64
        String photoBase64 = Base64.getEncoder().encodeToString(photo.getBytes());

        // Create the dynamic HTML content with the received values
        String htmlContent = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous" />
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
    <title>Document</title>
    <style>
        body {
            background-color: white;
            display: flex;
            flex-direction: column;
            gap: 200px;
            justify-content: center;
            align-items: center;
        }
        .card {
            width: 973px;
            height: 638px;
            border-radius: 20px;
            background-color: #ffffff;
            border-top: 20px solid #17146e;
            margin-top: 20px;
        }
        .header {
            border-bottom: 5px solid #25257d;
            text-align: center;
            color: #17146e;
            font-family: Inter;
            font-size: 50px;
            font-weight: 500;
            line-height: 60.51px;
        }
        .main {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-top: 30px;
            display: grid;
            grid-template-columns: 2.3fr 0.7fr;
        }
        .form {
            margin-left: 54px;
            margin-top: 51px;
        }
        table {
            border-collapse: collapse;
        }
        table tr {
            padding-bottom: 15px; /* Add spacing between rows */
        }
        table tr td {
            font-family: Inter;
            font-size: 28px;
            font-weight: 550;
            line-height: 33.89px;
            color: #17146e;
            padding: 15px 0; /* Add vertical padding */
        }
        table tr td input {
            font-family: Inter;
            font-size: 28px;
            font-weight: 400;
            line-height: 33.89px;
            text-align: left;
            color: #383747;
            outline: none;
            border: 0px;
            background-color: #ffffff;
            padding-left: 5px;
        }
        table tr td input:focus {
            outline: none;
            background-color: #f5f5f6;
        }
        table tr td textarea {
            font-family: Inter;
            font-size: 28px;
            font-weight: 400;
            line-height: 33.89px;
            text-align: left;
            color: #383747;
            outline: none;
            border: 0px;
            background-color: #ffffff;
            width: 300px;
            padding-left: 5px;
            resize: none; /* Prevents resizing of the textarea */
            overflow-wrap: break-word; /* Ensures words break and wrap */
            word-wrap: break-word; /* For older browsers */
        }
        table tr td textarea:focus {
            outline: none;
            background-color: #f5f5f6;
        }
        img {
            width: 194px;
            height: 231px;
            border-radius: 10px;
            border: 1px solid #000000;
            margin-top: 54px;
        }
        .footer {
            position: absolute;
            bottom: 0px;
            background-color: #2c2c64;
            width: 100%%;
            height: 123px;
            font-family: Inter;
            font-size: 28px;
            font-weight: 500;
            line-height: 40px;
            text-align: center;
            color: #ffffff;
            border-radius: 0 0 20px 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        @media print {
            #button {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="card">
        <header class="header">
            <p>PERSONAL ID CARD</p>
        </header>
        <main class="main">
            <form class="form">
                <table style="width: -webkit-fill-available;">
                    <tr>
                        <td>Name</td>
                        <td>:&nbsp;<input type="text" value="%s" readonly /></td>
                    </tr>
                    <tr>
                        <td>Business Name</td>
                        <td>:&nbsp;<input type="text" value="%s" readonly /></td>
                    </tr>
                    <tr>
                        <td>Email Address</td>
                        <td>:&nbsp;<input type="text" value="%s" readonly /></td>
                    </tr>
                    <tr>
                        <td>Business Address</td>
                        <td>:&nbsp;<textarea readonly style="vertical-align:middle;">%s</textarea></td>
                    </tr>
                </table>
            </form>
            <div><img src="data:image/jpeg;base64,%s" alt="Photo" /></div>
        </main>
        <footer class="footer">
            <p>Note: This card is the property of the company. Please carry this. If found, return to Address above</p>
        </footer>
    </div>
    <div class="card">
        <header class="header">
            <p>PERSONAL ID CARD - BACK</p>
        </header>
        <main class="main">
            <form class="form">
                <table style="width: -webkit-fill-available;">
                    <tr>
                        <td>Phone Number</td>
                        <td>:&nbsp;<input type="text" value="%s" readonly /></td>
                    </tr>
                    <tr>
                        <td>Current Address</td>
                        <td>:&nbsp;<textarea readonly style="vertical-align:middle;">%s</textarea></td>
                    </tr>
                    <tr>
                        <td>Permanent Address</td>
                        <td>:&nbsp;<textarea readonly style="vertical-align:middle;">%s</textarea></td>
                    </tr>
                </table>
            </form>
        </main>
        <footer class="footer">
            <p>Note: This card is the property of the company. Please carry this. If found, return to Address above</p>
        </footer>
    </div>
    <button class="btn btn-success" id="button" onclick="window.print();">printME!</button>
</body>
</html>
""".formatted(name, businessName, emailAddress, businessAddress, photoBase64, phoneNumber, currentAddress, permanentAddress);

        // Return the dynamically generated HTML
        return ResponseEntity.ok().body(htmlContent);

//        return savedIdCard;
    }
    public void logActivity(String type, String details, String userEmail) {
        Activity activity = new Activity();
        activity.setType(type);
        activity.setDetails(details);
        activity.setTimestamp(new java.util.Date().toString());
        activity.setUserEmail(userEmail);
        activityRepository.save(activity);
    }
    @PostMapping("/validate-image")
    public ResponseEntity<String> validateImage(@RequestParam("photo") MultipartFile photo) {
        try {
            if (photo.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty.");
            }

            // Create a temporary file
            File tempFile = File.createTempFile("validate", ".png");
            photo.transferTo(tempFile);

            // Check if the image can be read
            BufferedImage testImage = ImageIO.read(tempFile);
            if (testImage == null) {
                return ResponseEntity.badRequest().body("Uploaded file is not a valid image.");
            }

            return ResponseEntity.ok("Image validated successfully.");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error validating the image file: " + e.getMessage());
        }
    }
    @GetMapping("/idcard")
    public Map<String, Object> findIdCardByIdOrEmail(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String email) {
        try {
            List<IdCard> idCards = retailerService.findIdCardByIdOrEmail(id, email);
            Map<String, Object> response = new HashMap<>();
            response.put("idCards", idCards);
            return response;
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            return response;
        }
    }
    @GetMapping("/recent-activities")
    public List<Activity> getRecentActivities(@RequestParam String userEmail) {
        return retailerService.getRecentActivities(userEmail);
    }

    @GetMapping("/idcard-history")
    public Map<String, Object> getIdCardHistory(@RequestParam String retailerEmail) {
        try {
            List<IdCard> idCardHistory = retailerService.getIdCardHistory(retailerEmail);
            Map<String, Object> response = new HashMap<>();
            response.put("idCardHistory", idCardHistory);
            return response;
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            return response;
        }
    }
    @GetMapping("/view-id-card")
    public ResponseEntity<String> viewIdCard() {
        String htmlContent = """
            <!DOCTYPE html>
                           <html lang="en">
                           <head>
                             <meta charset="UTF-8" />
                             <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                             <link
                                     href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
                                     rel="stylesheet"
                                     integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
                                     crossorigin="anonymous"
                             />
                             <script
                                     src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
                                     integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
                                     crossorigin="anonymous"
                             ></script>
                             <title>Document</title>
                             <style>
                           
                               body {
                                 background-color: white;
                                 display: flex;
                                 flex-direction: column;
                                 gap: 200px;
                                 justify-content: center;
                                 align-items: center;
                               }
                               .card {
                                 width: 973px;
                                 height: 638px;
                                 border-radius: 20px;
                                 background-color: #ffffff;
                                 border-top: 20px solid #17146e;
                                 margin-top: 20px;
                               }
                               .header {
                                 border-bottom: 5px solid #25257d;
                                 text-align: center;
                                 color: #17146e;
                                 font-family: Inter;
                                 font-size: 50px;
                                 font-weight: 500;
                                 line-height: 60.51px;
                               }
                           
                               .main {
                                 display: flex;
                                 justify-content: center;
                                 align-items: center;
                                 margin-top: 30px;
                                 display: grid;
                                 grid-template-columns: 2.3fr 0.7fr;
                               }
                               .form {
                                 margin-left: 54px;
                                 margin-top: 51px;
                               }
                               table {
                                 border-collapse: collapse;
                               }
                               table tr {
                                 padding-bottom: 15px; /* Add spacing between rows */
                               }
                               table tr td {
                                 font-family: Inter;
                                 font-size: 28px;
                                 font-weight: 550;
                                 line-height: 33.89px;
                                 color: #17146e;
                                 padding: 15px 0; /* Add vertical padding */
                               }
                               table tr td input {
                                 font-family: Inter;
                                 font-size: 28px;
                                 font-weight: 400;
                                 line-height: 33.89px;
                                 text-align: left;
                                 color: #383747;
                                 outline: none;
                                 border: 0px;
                                 background-color: #ffffff;
                           /* width: 300px; */
                                 padding-left: 5px;
                               }
                               table tr td input:focus {
                                 outline: none;
                                 background-color: #f5f5f6;
                               }
                               table tr td textarea {
                                 font-family: Inter;
                                 font-size: 28px;
                                 font-weight: 400;
                                 line-height: 33.89px;
                                 text-align: left;
                                 color: #383747;
                                 outline: none;
                                 border: 0px;
                                 background-color: #ffffff;
                                 width: 300px;
                                 padding-left: 5px;
                                 resize: none; /* Prevents resizing of the textarea */
                                 overflow-wrap: break-word; /* Ensures words break and wrap */
                                 word-wrap: break-word; /* For older browsers */
                               }
                               table tr td textarea:focus {
                                 outline: none;
                                 background-color: #f5f5f6;
                               }
                               img {
                                 width: 194px;
                                 height: 231px;
                                 border-radius: 10px;
                                 border: 1px solid #000000;
                                 margin-top: 54px;
                               }
                           
                               .footer {
                                 position: absolute;
                                 bottom: 0px;
                                 background-color: #2c2c64;
                                 width: 100%;
                                 height: 123px;
                                 font-family: Inter;
                                 font-size: 28px;
                                 font-weight: 500;
                                 line-height: 40px;
                                 text-align: center;
                                 color: #ffffff;
                                 border-radius: 0 0 20px 20px;
                                 display: flex;
                                 align-items: center;
                                 justify-content: center;
                               }
                               @media print{
                                 #button{
                                   display:none;
                                 }
                               }
                             </style>
                           </head>
                           <body>
                           <div class="card">
                             <header class="header">
                               <p>PERSONAL ID CARD</p>
                             </header>
                             <main class="main">
                               <form class="form">
                                 <table style="width: -webkit-fill-available; ">
                                   <tr>
                                     <td>Name</td>
                                     <td>:&nbsp;<input type="text" value="Ritik soni" /></td>
                                   </tr>
                                   <tr>
                                     <td>Business Name</td>
                                     <td>:&nbsp;<input type="text" value="Scriza pvt. ltd." /></td>
                                   </tr>
                                   <tr>
                                     <td>Email Address</td>
                                     <td>:&nbsp;<input type="text" value="Ritiksoni101@gmail.com" /></td>
                                   </tr>
                                   <tr>
                                     <td>Business Address</td>
                                     <td>:&nbsp;<textarea name="" id="" value="" style="vertical-align:middle;">logix park , sector 16 , noida (UP)</textarea></td>
                                   </tr>
                                 </table>
                               </form>
                               <div><img src="/NiceAdmin/assets/img/IMG_9082.JPG" alt="" /></div>
                             </main>
                             <footer class="footer" >
                               <p>
                                 Note: This card is the property of the company. Please carry this. If
                                 found, return to Address above
                               </p>
                             </footer>
                           </div>
                           </body>
                           <body>
                           <div class="card">
                             <header class="header">
                               <p>PERSONAL ID CARD</p>
                             </header>
                             <main class="main">
                               <form class="form">
                                 <table style="width: -webkit-fill-available; ">
                                   <tr>
                                     <td>Phone Number</td>
                                     <td>:&nbsp;<input type="text" value = "+91 8890846567"/></td>
                                   </tr>
                                   <tr>
                                     <td>Current Address</td>
                                     <td>:&nbsp;<textarea type="text" value = "" style="vertical-align:middle;">Rajesh Furniture , Rani bagh , shakurpur , Delhi</textarea></td>
                                   </tr>
                                   <tr>
                                     <td>Permanent Address</td>
                                     <td>:&nbsp;<textarea type="text" style="vertical-align:middle;">Sadar bazaar  , Nimbahera , Rajasthan</textarea></td>
                                   </tr>
                                 </table>
                               </form>
                             </main>
                             <footer class="footer">
                               <p>
                                 Note: This card is the property of the company. Please carry this. If
                                 found, return to Address above
                               </p>
                             </footer>
                           </div>
                           <button class="btn btn-success" id="button" onclick="window.print();" >printME!</button>
                           </body>
                           </html>
        """;
        return ResponseEntity.ok().body(htmlContent);
    }
    }



