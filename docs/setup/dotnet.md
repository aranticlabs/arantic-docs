---
sidebar_position: 4
sidebar_label: .NET Developer Setup
description: Set up AI-assisted coding for C#, ASP.NET Core, WinForms, WPF, and MAUI development in Visual Studio and VS Code with Claude Code and GitHub Copilot.
keywords: [.NET setup, C# AI coding, ASP.NET Core, Visual Studio AI, WinForms, WPF, MAUI, Claude Code .NET, GitHub Copilot]
---

# .NET Developer Setup

Covers C#, ASP.NET Core, WinForms, WPF, and MAUI. If you work primarily in **Visual Studio** and prefer a GUI-first workflow, this guide covers everything you need without requiring a terminal.

---

## Terminal-free setup (Visual Studio only)

If you live entirely inside Visual Studio and don't want a terminal, this is all you need:

### 1. Install GitHub Copilot in Visual Studio

GitHub Copilot is built into Visual Studio 2022 version 17.10 and later. If you're on an older version, install it from **Extensions → Manage Extensions → search "GitHub Copilot"**.

Sign in with your GitHub account in the Copilot panel. You need a **GitHub Copilot subscription** (Individual, Business, or Enterprise), separate from your Anthropic/Claude subscription.

What you get inside Visual Studio:
- **Inline completions**: suggestions appear as you type, accept with `Tab`
- **Copilot Chat panel**: open with `View → GitHub Copilot Chat` or `Ctrl+\, Ctrl+C`
- **Smart actions**: right-click any selection for "Explain", "Fix", "Generate tests", "Generate docs"
- **Commit message generation**: in the Git Changes window, click the Copilot sparkle icon

### 2. Use Copilot Chat effectively

Open the chat panel and use it for anything you'd normally ask a colleague:

```
Explain what this method does and whether there are any edge cases I should handle.
```

```
Refactor this class to follow the repository pattern. The data access is currently
mixed into the controller - separate it into a service and a repository.
```

```
Generate xUnit tests for every public method in this class. Include tests for null
inputs and boundary values.
```

```
I'm getting this exception: [paste stack trace]. What is causing it and how do I fix it?
```

### 3. Designer-specific tips (WinForms / WPF / MAUI)

The Visual Studio designer works visually - Copilot helps with the code behind it:

- **WinForms:** Select any event handler stub the designer generated, right-click → Copilot → "Explain". Ask Copilot Chat to "fill in this Click handler to validate the form and call SaveCustomer()".
- **WPF:** Paste a ViewModel stub and ask "Add INotifyPropertyChanged to every property in this class and implement RelayCommand for the Save and Cancel buttons."
- **MAUI:** Ask "Convert this WPF ViewModel to work with MAUI - replace `ICommand` with `RelayCommand` from CommunityToolkit.Mvvm."
- **XAML:** Copilot understands XAML. Select a block in the XAML editor and ask "Add a loading spinner that shows while IsLoading is true."

---

## With a terminal (optional but recommended for ASP.NET Core / APIs)

If you're building ASP.NET Core APIs, background services, or anything that runs `dotnet` commands, adding Claude Code gives you agentic multi-file tasks that Copilot can't do alone.

### 1. Install Node.js

Claude Code is distributed via npm. Download Node.js 18+ from [nodejs.org](https://nodejs.org) (Windows installer, no configuration needed).

Verify in a terminal (Command Prompt or PowerShell):

```powershell
node --version   # should print v18.x or higher
npm --version
```

### 2. Install Claude Code

```powershell
npm install -g @anthropic-ai/claude-code
```

Open a terminal in your project folder and run:

```powershell
cd C:\Projects\MyService
claude
```

### 3. Configure project context (CLAUDE.md)

Create a `CLAUDE.md` file at the solution root. Claude Code reads it on every session:

```markdown
# Project context

## Stack
- .NET 9, C# 13, ASP.NET Core (minimal API style)
- Entity Framework Core 9 with SQL Server
- MediatR for CQRS, FluentValidation for input validation
- xUnit + Moq for testing

## Conventions
- Follow MediatR request/handler pattern for all business logic
- Never put business logic in controllers - controllers only dispatch commands/queries
- Use record types for DTOs and command/query objects
- All public APIs must have XML doc comments
- Async all the way down - no .Result or .Wait()

## Commands
- `dotnet build` - build solution
- `dotnet test` - run all tests
- `dotnet run --project src/Api` - start API
- `dotnet ef migrations add MigrationName` - add EF migration

## Do not modify
- `src/Infrastructure/Migrations/` - managed by EF Core tooling
```

### 4. Claude Code tasks for .NET

```
Generate a MediatR command and handler for creating a new Order. The handler
should validate the request with FluentValidation, persist via the repository,
and publish an OrderCreated domain event. Follow the pattern in
src/Application/Commands/CreateCustomer.cs.
```

```
Review my staged changes for async anti-patterns (.Result, .Wait(), async void)
and any EF Core queries that could cause N+1 problems.
```

```
Write xUnit tests for the CreateOrderCommandHandler. Mock the repository and event
publisher. Cover: happy path, validation failure, and repository exception.
```

---

## Tips

- **Copilot works well with C# idioms.** It understands LINQ, async/await, nullable reference types, and pattern matching. Be explicit about which version of C# you're targeting if you need a specific feature.
- **For Copilot Chat: use `#file` references.** In VS 2022 17.8+, type `#` in the chat panel to reference a specific file - this gives Copilot exact context without copy-pasting.
- **WinForms/WPF: don't ask AI to design the UI.** The visual designer is faster for layout. Use AI for the logic behind it.
- **EF Core migrations: never auto-generate blindly.** Always review generated migrations before applying. Ask Copilot to "explain what this migration does" if you're unsure.
- **NuGet packages: verify before adding.** AI sometimes suggests outdated or renamed packages. Check [nuget.org](https://nuget.org) to confirm the current package name and version.
