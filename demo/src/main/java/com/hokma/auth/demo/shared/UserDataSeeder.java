package com.hokma.auth.demo.shared;

import com.hokma.auth.demo.auth.entity.User;
import com.hokma.auth.demo.crm.entity.*;
import com.hokma.auth.demo.crm.entity.Lead.LeadSource;
import com.hokma.auth.demo.crm.entity.Lead.LeadStatus;
import com.hokma.auth.demo.crm.entity.Contact.ContactStatus;
import com.hokma.auth.demo.crm.entity.Contact.ContactType;
import com.hokma.auth.demo.crm.entity.Task.TaskPriority;
import com.hokma.auth.demo.crm.entity.Task.TaskStatus;
import com.hokma.auth.demo.crm.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Seeds realistic demo data for a newly registered user.
 * Called once per user after their first login/signup.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserDataSeeder {

    private final CompanyRepository companyRepository;
    private final ContactRepository contactRepository;
    private final LeadRepository    leadRepository;
    private final TaskRepository    taskRepository;
    private final TeamRepository    teamRepository;

    @Transactional
    public void seedForUser(User user) {
        // Skip if user already has data
        if (contactRepository.countByOwner_Id(user.getId()) > 0) {
            return;
        }

        log.info("Seeding demo data for new user: {}", user.getEmail());

        // ── Companies ─────────────────────────────────────────────────────
        Company acme = company("Acme Corp",         "https://acmecorp.com",    "Technology", "51-200",  "+1-415-555-0101", "hello@acmecorp.com");
        Company nova = company("Nova Dynamics",     "https://novadyn.io",      "Finance",    "11-50",   "+1-212-555-0182", "info@novadyn.io");
        Company peak = company("Peak Retail Group", "https://peakretail.com",  "Retail",     "201-500", "+1-312-555-0193", "sales@peakretail.com");
        Company zest = company("Zest Health",       "https://zesthealth.io",   "Healthcare", "11-50",   "+1-650-555-0174", "hello@zesthealth.io");
        Company bolt = company("Bolt Logistics",    "https://boltlogistics.com","Logistics", "51-200",  "+1-469-555-0165", "ops@boltlogistics.com");

        // ── Contacts ──────────────────────────────────────────────────────
        Contact sarah  = contact("Sarah",  "Chen",    "sarah.chen@acmecorp.com",     "+1-415-555-0201", "VP of Engineering",   acme, user);
        Contact marcus = contact("Marcus", "Johnson", "marcus@novadyn.io",           "+1-212-555-0202", "CFO",                 nova, user);
        Contact priya  = contact("Priya",  "Sharma",  "priya.sharma@peakretail.com", "+1-312-555-0203", "Head of Procurement", peak, user);
        Contact liam   = contact("Liam",   "O'Brien", "liam@zesthealth.io",          "+1-650-555-0204", "CEO",                 zest, user);
        Contact elena  = contact("Elena",  "Vasquez", "elena@boltlogistics.com",     "+1-469-555-0205", "Operations Director", bolt, user);
        Contact tom    = contact("Thomas", "Park",    "thomas.park@acmecorp.com",    "+1-415-555-0206", "Product Manager",     acme, user);
        contact("Mei",   "Lin",     "mei.lin@novadyn.io",          "+1-212-555-0207", "Director of Finance", nova, user);
        contact("James", "Carter",  "james@peakretail.com",        "+1-312-555-0208", "Buyer",               peak, user);

        // ── Leads / Deals ─────────────────────────────────────────────────
        Lead l1 = lead("Acme Enterprise Suite",   "Full CRM rollout for Acme engineering team", 120_000, LeadStatus.PROPOSAL,    LeadSource.REFERRAL,       sarah,  user, today(30));
        Lead l2 = lead("Nova Analytics Platform", "Data analytics dashboard integration",        85_000, LeadStatus.NEGOTIATION, LeadSource.WEBSITE,        marcus, user, today(15));
        Lead l3 = lead("Peak Retail POS Upgrade", "Point-of-sale system modernisation",         200_000, LeadStatus.QUALIFIED,   LeadSource.TRADE_SHOW,     priya,  user, today(45));
        Lead l4 = lead("Zest Health Portal",      "Patient management web portal",               55_000, LeadStatus.NEW,         LeadSource.COLD_CALL,      liam,   user, today(60));
        lead("Bolt Fleet Tracker",       "Real-time fleet tracking module",             40_000, LeadStatus.WON,         LeadSource.EMAIL_CAMPAIGN, elena,  user, today(-5));
        lead("Acme Mobile App",          "iOS + Android CRM companion app",             75_000, LeadStatus.CONTACTED,   LeadSource.SOCIAL_MEDIA,   tom,    user, today(20));
        lead("Nova Payroll Integration", "Payroll system API integration",              30_000, LeadStatus.LOST,        LeadSource.REFERRAL,       marcus, user, today(-10));

        // ── Tasks ─────────────────────────────────────────────────────────
        task("Follow up with Sarah on proposal",     "Review pricing deck before sending",   today(1),  TaskStatus.PENDING,     TaskPriority.HIGH,   l1, user);
        task("Prepare Nova demo environment",        "Set up sandbox with sample data",      today(3),  TaskStatus.IN_PROGRESS, TaskPriority.HIGH,   l2, user);
        task("Send Peak Retail contract draft",      null,                                   today(5),  TaskStatus.PENDING,     TaskPriority.MEDIUM, l3, user);
        task("Schedule Zest Health discovery call",  "Book 30-min intro call with Liam",     today(7),  TaskStatus.PENDING,     TaskPriority.MEDIUM, l4, user);
        task("Bolt fleet tracker go-live checklist", "Verify all checklist items are done",  today(-1), TaskStatus.COMPLETED,   TaskPriority.HIGH,   null, user);
        task("Update CRM pipeline report",           "Export Q4 pipeline to PDF",            today(10), TaskStatus.PENDING,     TaskPriority.LOW,    null, user);
        task("Onboard Acme admin users",             "Create accounts for 5 Acme admins",    today(4),  TaskStatus.IN_PROGRESS, TaskPriority.MEDIUM, l1, user);

        // ── Team ──────────────────────────────────────────────────────────
        Team salesTeam = Team.builder()
            .name("Sales Team Alpha")
            .description("Core sales team handling enterprise accounts")
            .owner(user)
            .build();
        salesTeam.getMembers().add(user);
        teamRepository.save(salesTeam);

        log.info("Demo data seeded for user: {}", user.getEmail());
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private Company company(String name, String website, String industry,
                            String size, String phone, String email) {
        return companyRepository.save(Company.builder()
            .name(name).website(website).industry(industry)
            .size(size).phone(phone).email(email).build());
    }

    private Contact contact(String first, String last, String email, String phone,
                            String jobTitle, Company company, User owner) {
        return contactRepository.save(Contact.builder()
            .firstName(first).lastName(last).email(email).phone(phone)
            .jobTitle(jobTitle).companyEntity(company).owner(owner)
            .status(ContactStatus.ACTIVE).type(ContactType.COMPANY_REPRESENTATIVE)
            .build());
    }

    private Lead lead(String title, String description, long value,
                      LeadStatus status, LeadSource source,
                      Contact contact, User assignedTo, LocalDate closeDate) {
        return leadRepository.save(Lead.builder()
            .title(title).description(description)
            .value(BigDecimal.valueOf(value))
            .status(status).source(source)
            .contact(contact).assignedTo(assignedTo)
            .expectedCloseDate(closeDate).build());
    }

    private void task(String title, String description, LocalDate dueDate,
                      TaskStatus status, TaskPriority priority,
                      Lead lead, User user) {
        taskRepository.save(Task.builder()
            .title(title).description(description).dueDate(dueDate)
            .status(status).priority(priority)
            .assignedTo(user).createdBy(user).lead(lead).build());
    }

    private static LocalDate today(int plusDays) {
        return LocalDate.now().plusDays(plusDays);
    }
}
